import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AttendanceSession, Teacher } from '@/types/attendance';
import {
  getActiveSession,
  startAttendanceSession,
  clearActiveSession,
} from '@/lib/storage';

interface SessionContextType {
  activeSession: AttendanceSession | null;
  timeRemaining: number; // in seconds
  isSessionActive: boolean;
  startSession: (teacher: Teacher, subject: string, division: string, batch: string) => AttendanceSession;
  endSession: () => void;
  refreshSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const refreshSession = useCallback(() => {
    const session = getActiveSession();
    setActiveSession(session);
    
    if (session) {
      const endTime = new Date(session.endTime);
      const remaining = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
      setTimeRemaining(remaining);
    } else {
      setTimeRemaining(0);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const session = getActiveSession();
      
      if (!session) {
        setActiveSession(null);
        setTimeRemaining(0);
        return;
      }

      const endTime = new Date(session.endTime);
      const remaining = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
      
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearActiveSession();
        setActiveSession(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const startSession = (teacher: Teacher, subject: string, division: string, batch: string): AttendanceSession => {
    const session = startAttendanceSession(teacher, subject, division, batch);
    setActiveSession(session);
    setTimeRemaining(5 * 60); // 5 minutes
    return session;
  };

  const endSession = () => {
    clearActiveSession();
    setActiveSession(null);
    setTimeRemaining(0);
  };

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        timeRemaining,
        isSessionActive: !!activeSession && timeRemaining > 0,
        startSession,
        endSession,
        refreshSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
