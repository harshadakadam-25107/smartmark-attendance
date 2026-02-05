import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Teacher } from '@/types/attendance';
import { getCurrentTeacher, setCurrentTeacher, authenticateTeacher } from '@/lib/storage';

interface AuthContextType {
  teacher: Teacher | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    // Check for existing session
    const existingTeacher = getCurrentTeacher();
    if (existingTeacher) {
      setTeacher(existingTeacher);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const authenticatedTeacher = authenticateTeacher(email, password);
    
    if (authenticatedTeacher) {
      setTeacher(authenticatedTeacher);
      setCurrentTeacher(authenticatedTeacher);
      return { success: true, message: 'Login successful' };
    }
    
    return { success: false, message: 'Invalid email or password' };
  };

  const logout = () => {
    setTeacher(null);
    setCurrentTeacher(null);
  };

  return (
    <AuthContext.Provider
      value={{
        teacher,
        isAuthenticated: !!teacher,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
