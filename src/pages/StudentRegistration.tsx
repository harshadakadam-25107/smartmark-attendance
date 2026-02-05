import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Hash, Users, Layers, Bluetooth, Fingerprint, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { registerStudent, getStudentByPrn } from '@/lib/storage';
import { enrollFingerprint } from '@/lib/biometric';
import { DIVISIONS, BATCHES } from '@/types/attendance';
import { toast } from 'sonner';

const StudentRegistration: React.FC = () => {
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [prn, setPrn] = useState('');
  const [division, setDivision] = useState('');
  const [batch, setBatch] = useState('');
  const [bluetoothName, setBluetoothName] = useState('');
  const [fingerprintEnrolled, setFingerprintEnrolled] = useState(false);
  const [isEnrollingFingerprint, setIsEnrollingFingerprint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const handleEnrollFingerprint = async () => {
    if (!prn) {
      toast.error('Please enter your PRN first');
      return;
    }

    setIsEnrollingFingerprint(true);
    
    try {
      const result = await enrollFingerprint(prn);
      
      if (result.success) {
        setFingerprintEnrolled(true);
        toast.success('Fingerprint enrolled successfully!');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to enroll fingerprint. Please try again.');
    } finally {
      setIsEnrollingFingerprint(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !prn || !division || !batch || !bluetoothName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!fingerprintEnrolled) {
      toast.error('Please enroll your fingerprint');
      return;
    }

    // Check if PRN already exists
    const existingStudent = getStudentByPrn(prn);
    if (existingStudent) {
      toast.error('A student with this PRN is already registered');
      return;
    }

    setIsSubmitting(true);

    try {
      registerStudent({
        fullName,
        prn,
        division,
        batch,
        bluetoothDeviceName: bluetoothName,
        fingerprintEnrolled: true,
      });

      setRegistrationComplete(true);
      toast.success('Registration successful!');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border px-4 py-4">
          <div className="max-w-md mx-auto">
            <h1 className="text-lg font-semibold text-foreground text-center">Registration Complete</h1>
          </div>
        </header>

        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center animate-scale-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full gradient-success flex items-center justify-center shadow-glow">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome, {fullName}!
            </h2>
            <p className="text-muted-foreground mb-8">
              Your registration is complete. You can now mark attendance when sessions are active.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/student/attendance')}
                className="w-full h-14 rounded-xl gradient-primary text-primary-foreground font-semibold"
              >
                Mark Attendance
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full h-12 rounded-xl"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          <h1 className="text-lg font-semibold text-foreground">Student Registration</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details */}
            <div className="bg-card rounded-2xl p-6 shadow-card animate-slide-up">
              <h2 className="text-lg font-semibold text-foreground mb-4">Personal Details</h2>
              
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2 text-foreground">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 rounded-xl bg-muted border-0"
                  />
                </div>

                {/* PRN */}
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
                    className="h-12 rounded-xl bg-muted border-0"
                  />
                </div>

                {/* Division */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    Division
                  </Label>
                  <Select value={division} onValueChange={setDivision}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted border-0">
                      <SelectValue placeholder="Select your division" />
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
                  <Select value={batch} onValueChange={setBatch}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted border-0">
                      <SelectValue placeholder="Select your batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BATCHES.map((b) => (
                        <SelectItem key={b} value={b}>
                          Batch {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Device Setup */}
            <div className="bg-card rounded-2xl p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-lg font-semibold text-foreground mb-4">Device Setup</h2>
              
              <div className="space-y-4">
                {/* Bluetooth Device Name */}
                <div className="space-y-2">
                  <Label htmlFor="bluetooth" className="flex items-center gap-2 text-foreground">
                    <Bluetooth className="w-4 h-4 text-muted-foreground" />
                    Bluetooth Device Name
                  </Label>
                  <Input
                    id="bluetooth"
                    placeholder="e.g., John's Phone"
                    value={bluetoothName}
                    onChange={(e) => setBluetoothName(e.target.value)}
                    className="h-12 rounded-xl bg-muted border-0"
                  />
                  <p className="text-xs text-muted-foreground">
                    This should match your phone's Bluetooth name
                  </p>
                </div>

                {/* Fingerprint Enrollment */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground">
                    <Fingerprint className="w-4 h-4 text-muted-foreground" />
                    Fingerprint Authentication
                  </Label>
                  
                  {fingerprintEnrolled ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
                      <CheckCircle className="w-6 h-6 text-success" />
                      <span className="font-medium text-success">Fingerprint enrolled</span>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleEnrollFingerprint}
                      disabled={isEnrollingFingerprint}
                      className="w-full h-12 rounded-xl bg-muted hover:bg-muted/80 text-foreground"
                    >
                      {isEnrollingFingerprint ? (
                        <>
                          <Fingerprint className="w-5 h-5 mr-2 animate-pulse" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <Fingerprint className="w-5 h-5 mr-2" />
                          Enroll Fingerprint
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !fingerprintEnrolled}
              className="w-full h-14 rounded-xl gradient-primary text-primary-foreground font-semibold text-lg shadow-glow hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default StudentRegistration;
