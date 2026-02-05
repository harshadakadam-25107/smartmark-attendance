import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, CheckCircle, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StudentHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Student Portal</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Student Portal</h2>
            <p className="text-muted-foreground">
              Register or mark your attendance
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4 animate-slide-up">
            {/* Register Card */}
            <button
              onClick={() => navigate('/student/register')}
              className="w-full bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <UserPlus className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    New Registration
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    First time? Register your details and fingerprint
                  </p>
                </div>
                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                  →
                </div>
              </div>
            </button>

            {/* Mark Attendance Card */}
            <button
              onClick={() => navigate('/student/attendance')}
              className="w-full bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-success/10 group-hover:bg-success/20 transition-colors">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Mark Attendance
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Already registered? Mark your attendance here
                  </p>
                </div>
                <div className="text-muted-foreground group-hover:text-success transition-colors">
                  →
                </div>
              </div>
            </button>
          </div>

          {/* Info */}
          <div className="mt-8 p-4 bg-muted rounded-xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="font-semibold text-foreground mb-2">How it works:</h3>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li>1. Register once with your details and fingerprint</li>
              <li>2. When attendance is active, open the app</li>
              <li>3. Enter your PRN and verify with Bluetooth + Fingerprint</li>
              <li>4. You have 5 minutes to mark attendance</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentHome;
