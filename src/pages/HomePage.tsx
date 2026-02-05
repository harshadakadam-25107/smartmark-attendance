import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, UserCog, Fingerprint, Bluetooth } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-primary py-8 px-4 text-center">
        <div className="max-w-md mx-auto animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-card/20 backdrop-blur-sm flex items-center justify-center">
            <Fingerprint className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">
            SmartAttendance
          </h1>
          <p className="text-primary-foreground/80 text-sm">
            Bluetooth + Fingerprint Verification
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 -mt-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Info Card */}
          <div className="bg-card rounded-2xl p-6 shadow-card animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <Bluetooth className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Secure Attendance</h3>
                <p className="text-sm text-muted-foreground">
                  Verified by proximity & biometrics
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-muted">
                <p className="text-2xl font-bold text-primary">5</p>
                <p className="text-xs text-muted-foreground">Min Window</p>
              </div>
              <div className="p-3 rounded-xl bg-muted">
                <p className="text-2xl font-bold text-accent">12</p>
                <p className="text-xs text-muted-foreground">Subjects</p>
              </div>
              <div className="p-3 rounded-xl bg-muted">
                <p className="text-2xl font-bold text-success">100%</p>
                <p className="text-xs text-muted-foreground">Accurate</p>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-lg font-semibold text-foreground text-center">
              Select Your Role
            </h2>

            {/* Student Card */}
            <button
              onClick={() => navigate('/student')}
              className="w-full bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl gradient-primary group-hover:shadow-glow transition-all duration-300">
                  <GraduationCap className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    I'm a Student
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Register or mark your attendance
                  </p>
                </div>
                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                  →
                </div>
              </div>
            </button>

            {/* Teacher Card */}
            <button
              onClick={() => navigate('/teacher/login')}
              className="w-full bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl gradient-success group-hover:shadow-glow transition-all duration-300">
                  <UserCog className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    I'm a Teacher
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Start sessions & view reports
                  </p>
                </div>
                <div className="text-muted-foreground group-hover:text-accent transition-colors">
                  →
                </div>
              </div>
            </button>
          </div>

          {/* Footer Info */}
          <div className="text-center pt-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-xs text-muted-foreground">
              Attendance is time-restricted to 5 minutes per lecture
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
