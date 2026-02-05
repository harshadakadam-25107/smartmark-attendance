import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Hash, 
  Bluetooth, 
  Fingerprint, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/contexts/SessionContext';
import { getStudentByPrn, markAttendance, getStudentAttendanceCount } from '@/lib/storage';
import { verifyProximity, enableBluetooth } from '@/lib/bluetooth';
import { verifyFingerprint } from '@/lib/biometric';
import { toast } from 'sonner';

type VerificationStep = 'prn' | 'bluetooth' | 'fingerprint' | 'success' | 'error';

interface AttendanceResult {
  date: string;
  time: string;
  subject: string;
  totalCount: number;
}

const StudentAttendance: React.FC = () => {
  const navigate = useNavigate();
  const { activeSession, timeRemaining, isSessionActive, refreshSession } = useSession();
  
  const [prn, setPrn] = useState('');
  const [currentStep, setCurrentStep] = useState<VerificationStep>('prn');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attendanceResult, setAttendanceResult] = useState<AttendanceResult | null>(null);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrnSubmit = async () => {
    if (!prn.trim()) {
      toast.error('Please enter your PRN');
      return;
    }

    if (!isSessionActive || !activeSession) {
      setErrorMessage('No active attendance session. Please try again when your teacher starts a session.');
      setCurrentStep('error');
      return;
    }

    const student = getStudentByPrn(prn);
    if (!student) {
      setErrorMessage('PRN not found. Please register first or check your PRN.');
      setCurrentStep('error');
      return;
    }

    // Check if student matches the session's division and batch
    if (student.division !== activeSession.division || student.batch !== activeSession.batch) {
      setErrorMessage(`This session is for Division ${activeSession.division}, Batch ${activeSession.batch}. Your registration shows Division ${student.division}, Batch ${student.batch}.`);
      setCurrentStep('error');
      return;
    }

    setCurrentStep('bluetooth');
    await handleBluetoothVerification();
  };

  const handleBluetoothVerification = async () => {
    if (!activeSession) return;

    setIsProcessing(true);
    
    try {
      await enableBluetooth();
      
      const result = await verifyProximity(activeSession.bluetoothDeviceName);
      
      if (result.success) {
        setCurrentStep('fingerprint');
        await handleFingerprintVerification();
      } else {
        setErrorMessage(result.message);
        setCurrentStep('error');
      }
    } catch (error) {
      setErrorMessage('Bluetooth verification failed. Please try again.');
      setCurrentStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFingerprintVerification = async () => {
    setIsProcessing(true);
    
    try {
      const result = await verifyFingerprint(prn);
      
      if (result.success) {
        await handleMarkAttendance();
      } else {
        setErrorMessage(result.message);
        setCurrentStep('error');
      }
    } catch (error) {
      setErrorMessage('Fingerprint verification failed. Please try again.');
      setCurrentStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!activeSession) return;

    const student = getStudentByPrn(prn);
    if (!student) {
      setErrorMessage('Student not found');
      setCurrentStep('error');
      return;
    }

    try {
      const record = markAttendance(student, activeSession);
      const totalCount = getStudentAttendanceCount(prn, activeSession.subject);
      
      setAttendanceResult({
        date: record.date,
        time: record.time,
        subject: activeSession.subject,
        totalCount,
      });
      
      setCurrentStep('success');
      toast.success('Attendance marked successfully!');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to mark attendance');
      setCurrentStep('error');
    }
  };

  const handleReset = () => {
    setPrn('');
    setCurrentStep('prn');
    setErrorMessage('');
    setAttendanceResult(null);
    refreshSession();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'prn':
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h2 className="text-lg font-semibold text-foreground mb-4">Enter Your PRN</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prn" className="flex items-center gap-2 text-foreground">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    PRN (Student ID)
                  </Label>
                  <Input
                    id="prn"
                    placeholder="e.g., 2024CS001"
                    value={prn}
                    onChange={(e) => setPrn(e.target.value.toUpperCase())}
                    className="h-14 rounded-xl bg-muted border-0 text-lg text-center font-mono"
                  />
                </div>

                <Button
                  onClick={handlePrnSubmit}
                  disabled={!prn.trim() || !isSessionActive}
                  className="w-full h-14 rounded-xl gradient-primary text-primary-foreground font-semibold text-lg"
                >
                  Verify & Mark Attendance
                </Button>
              </div>
            </div>
          </div>
        );

      case 'bluetooth':
        return (
          <div className="space-y-6 animate-scale-in">
            <div className="bg-card rounded-2xl p-8 shadow-card text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Bluetooth className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Verifying Bluetooth
              </h2>
              <p className="text-muted-foreground">
                Checking proximity to teacher's device...
              </p>
            </div>
          </div>
        );

      case 'fingerprint':
        return (
          <div className="space-y-6 animate-scale-in">
            <div className="bg-card rounded-2xl p-8 shadow-card text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                <Fingerprint className="w-10 h-10 text-accent animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Verify Fingerprint
              </h2>
              <p className="text-muted-foreground">
                Place your finger on the sensor...
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6 animate-scale-in">
            <div className="bg-card rounded-2xl p-8 shadow-card text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full gradient-success flex items-center justify-center shadow-glow">
                <CheckCircle className="w-12 h-12 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Attendance Marked!
              </h2>
              <p className="text-muted-foreground mb-6">
                Your attendance has been recorded successfully.
              </p>

              {attendanceResult && (
                <div className="bg-muted rounded-xl p-4 text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-semibold text-foreground">{attendanceResult.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-semibold text-foreground">{attendanceResult.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-semibold text-foreground">{attendanceResult.time}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">Total Attendance:</span>
                    <span className="font-bold text-success">{attendanceResult.totalCount} lectures</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() => navigate('/')}
              className="w-full h-14 rounded-xl bg-muted text-foreground font-semibold"
            >
              Done
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-6 animate-scale-in">
            <div className="bg-card rounded-2xl p-8 shadow-card text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Verification Failed
              </h2>
              <p className="text-muted-foreground">
                {errorMessage}
              </p>
            </div>

            <Button
              onClick={handleReset}
              className="w-full h-14 rounded-xl gradient-primary text-primary-foreground font-semibold"
            >
              Try Again
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/student')}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Mark Attendance</h1>
        </div>
      </header>

      {/* Session Status */}
      <div className="px-6 py-4">
        <div className="max-w-md mx-auto">
          {isSessionActive && activeSession ? (
            <div className="bg-success/10 border border-success/20 rounded-xl p-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="font-medium text-success">Session Active</span>
                </div>
                <div className="flex items-center gap-1 text-success font-mono font-bold">
                  <Clock className="w-4 h-4" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <div className="mt-2 text-sm text-foreground">
                <span className="font-medium">{activeSession.subject}</span>
                {' - '}
                Division {activeSession.division}, Batch {activeSession.batch}
              </div>
            </div>
          ) : (
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                <span className="font-medium text-warning">No Active Session</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Wait for your teacher to start an attendance session.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          {renderStep()}
        </div>
      </main>
    </div>
  );
};

export default StudentAttendance;
