// SmartAttendance Type Definitions

export interface Student {
  id: string;
  fullName: string;
  prn: string;
  division: string;
  batch: string;
  bluetoothDeviceName: string;
  fingerprintEnrolled: boolean;
  createdAt: Date;
}

export interface Teacher {
  id: string;
  fullName: string;
  email: string;
  password: string; // In production, this would be hashed
  subjects: string[];
  bluetoothDeviceName: string;
  createdAt: Date;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentPrn: string;
  studentName: string;
  subject: string;
  division: string;
  batch: string;
  teacherId: string;
  date: string;
  time: string;
  timestamp: Date;
}

export interface AttendanceSession {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  division: string;
  batch: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  bluetoothDeviceName: string;
}

export type Division = 'A' | 'B' | 'C' | 'D';
export type Batch = 'B1' | 'B2' | 'B3' | 'B4';

export const THEORY_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Computer Science',
  'Electronics',
  'Data Structures',
  'Database Management',
  'Operating Systems',
  'Computer Networks',
  'Software Engineering'
] as const;

export const LAB_SUBJECTS = [
  'Programming Lab',
  'Electronics Lab'
] as const;

export const ALL_SUBJECTS = [...THEORY_SUBJECTS, ...LAB_SUBJECTS] as const;

export type Subject = typeof ALL_SUBJECTS[number];

export const DIVISIONS: Division[] = ['A', 'B', 'C', 'D'];
export const BATCHES: Batch[] = ['B1', 'B2', 'B3', 'B4'];

// Session duration in milliseconds (5 minutes)
export const SESSION_DURATION_MS = 5 * 60 * 1000;
