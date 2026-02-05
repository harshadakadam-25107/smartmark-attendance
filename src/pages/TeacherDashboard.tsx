import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Square, Clock, Users, BookOpen, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/contexts/SessionContext';
import { DIVISIONS, BATCHES } from '@/types/attendance';
import { toast } from 'sonner';

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { teacher, logout, isAuthenticated } = useAuth();
  const { activeSession, timeRemaining, isSessionActive, startSession, endSession } = useSession();
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/teacher/login');
    }
  }, [isAuthenticated, navigate]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    if (!selectedSubject || !selectedDivision || !selectedBatch) {
      toast.error('Please select all fields');
      return;
    }

    if (!teacher) return;

    startSession(teacher, selectedSubject, selectedDivision, selectedBatch);
    toast.success('Attendance session started!');
  };

  const handleEndSession = () => {
    endSession();
    toast.info('Attendance session ended');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!teacher) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
              <p className="text-xs text-muted-foreground">{teacher.fullName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-destructive hover:text-destructive"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Active Session Card */}
          {isSessionActive && activeSession && (
            <div className="bg-card rounded-2xl p-6 shadow-card border-2 border-success animate-pulse-glow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <span className="font-semibold text-success">Session Active</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndSession}
                  className="rounded-xl"
                >
                  <Square className="w-4 h-4 mr-1" />
                  End
                </Button>
              </div>

              {/* Timer */}
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-muted">
                  <div>
                    <p className="text-4xl font-bold text-foreground">
                      {formatTime(timeRemaining)}
                    </p>
                    <p className="text-sm text-muted-foreground">remaining</p>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subject:</span>
                  <span className="font-medium text-foreground">{activeSession.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Division:</span>
                  <span className="font-medium text-foreground">{activeSession.division}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch:</span>
                  <span className="font-medium text-foreground">{activeSession.batch}</span>
                </div>
              </div>
            </div>
          )}

          {/* Start Session Form */}
          {!isSessionActive && (
            <div className="bg-card rounded-2xl p-6 shadow-card animate-slide-up">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Start Attendance Session
              </h2>

              <div className="space-y-4">
                {/* Subject */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    Subject
                  </Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted border-0">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacher.subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Division */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    Division
                  </Label>
                  <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted border-0">
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIVISIONS.map((div) => (
                        <SelectItem key={div} value={div}>
                          Division {div}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Batch */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    Batch
                  </Label>
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted border-0">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BATCHES.map((batch) => (
                        <SelectItem key={batch} value={batch}>
                          Batch {batch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleStartSession}
                  className="w-full h-14 rounded-xl gradient-primary text-primary-foreground font-semibold text-lg mt-4"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start 5-Minute Session
                </Button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={() => navigate('/teacher/reports')}
              className="bg-card rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all text-left"
            >
              <div className="p-3 rounded-xl bg-primary/10 w-fit mb-3">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">View Reports</h3>
              <p className="text-xs text-muted-foreground">Attendance history</p>
            </button>

            <button
              onClick={() => navigate('/teacher/reports')}
              className="bg-card rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all text-left"
            >
              <div className="p-3 rounded-xl bg-accent/10 w-fit mb-3">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">My Subjects</h3>
              <p className="text-xs text-muted-foreground">{teacher.subjects.length} assigned</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
