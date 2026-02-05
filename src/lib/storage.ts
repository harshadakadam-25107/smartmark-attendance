// Local Storage Service for SmartAttendance
import { Student, Teacher, AttendanceRecord, AttendanceSession } from '@/types/attendance';

const STORAGE_KEYS = {
  STUDENTS: 'smartattendance_students',
  TEACHERS: 'smartattendance_teachers',
  ATTENDANCE_RECORDS: 'smartattendance_records',
  ACTIVE_SESSION: 'smartattendance_active_session',
  CURRENT_TEACHER: 'smartattendance_current_teacher',
} as const;

// Initialize default teachers
const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: '1',
    fullName: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@college.edu',
    password: 'teacher123',
    subjects: ['Mathematics', 'Data Structures'],
    bluetoothDeviceName: 'TEACHER_SARAH_BT',
    createdAt: new Date(),
  },
  {
    id: '2',
    fullName: 'Prof. Michael Chen',
    email: 'michael.chen@college.edu',
    password: 'teacher123',
    subjects: ['Physics', 'Electronics', 'Electronics Lab'],
    bluetoothDeviceName: 'TEACHER_MICHAEL_BT',
    createdAt: new Date(),
  },
  {
    id: '3',
    fullName: 'Dr. Emily Davis',
    email: 'emily.davis@college.edu',
    password: 'teacher123',
    subjects: ['Computer Science', 'Programming Lab'],
    bluetoothDeviceName: 'TEACHER_EMILY_BT',
    createdAt: new Date(),
  },
];

// Helper functions
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize teachers if not present
export const initializeStorage = (): void => {
  const existingTeachers = getItem<Teacher[]>(STORAGE_KEYS.TEACHERS, []);
  if (existingTeachers.length === 0) {
    setItem(STORAGE_KEYS.TEACHERS, DEFAULT_TEACHERS);
  }
};

// Student operations
export const getStudents = (): Student[] => {
  return getItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
};

export const getStudentByPrn = (prn: string): Student | undefined => {
  const students = getStudents();
  return students.find(s => s.prn.toLowerCase() === prn.toLowerCase());
};

export const registerStudent = (student: Omit<Student, 'id' | 'createdAt'>): Student => {
  const students = getStudents();
  
  // Check if PRN already exists
  if (students.some(s => s.prn.toLowerCase() === student.prn.toLowerCase())) {
    throw new Error('A student with this PRN already exists');
  }
  
  const newStudent: Student = {
    ...student,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };
  
  students.push(newStudent);
  setItem(STORAGE_KEYS.STUDENTS, students);
  
  return newStudent;
};

// Teacher operations
export const getTeachers = (): Teacher[] => {
  return getItem<Teacher[]>(STORAGE_KEYS.TEACHERS, DEFAULT_TEACHERS);
};

export const authenticateTeacher = (email: string, password: string): Teacher | null => {
  const teachers = getTeachers();
  const teacher = teachers.find(
    t => t.email.toLowerCase() === email.toLowerCase() && t.password === password
  );
  return teacher || null;
};

export const getCurrentTeacher = (): Teacher | null => {
  return getItem<Teacher | null>(STORAGE_KEYS.CURRENT_TEACHER, null);
};

export const setCurrentTeacher = (teacher: Teacher | null): void => {
  setItem(STORAGE_KEYS.CURRENT_TEACHER, teacher);
};

// Attendance session operations
export const getActiveSession = (): AttendanceSession | null => {
  const session = getItem<AttendanceSession | null>(STORAGE_KEYS.ACTIVE_SESSION, null);
  
  if (session) {
    // Check if session is still active
    const endTime = new Date(session.endTime);
    if (new Date() > endTime) {
      // Session has expired
      clearActiveSession();
      return null;
    }
    return session;
  }
  
  return null;
};

export const startAttendanceSession = (
  teacher: Teacher,
  subject: string,
  division: string,
  batch: string
): AttendanceSession => {
  const now = new Date();
  const endTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
  
  const session: AttendanceSession = {
    id: crypto.randomUUID(),
    teacherId: teacher.id,
    teacherName: teacher.fullName,
    subject,
    division,
    batch,
    startTime: now,
    endTime,
    isActive: true,
    bluetoothDeviceName: teacher.bluetoothDeviceName,
  };
  
  setItem(STORAGE_KEYS.ACTIVE_SESSION, session);
  return session;
};

export const clearActiveSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
};

// Attendance record operations
export const getAttendanceRecords = (): AttendanceRecord[] => {
  return getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
};

export const markAttendance = (
  student: Student,
  session: AttendanceSession
): AttendanceRecord => {
  const records = getAttendanceRecords();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Check if already marked for this session
  const existingRecord = records.find(
    r =>
      r.studentPrn === student.prn &&
      r.subject === session.subject &&
      r.date === today &&
      r.division === session.division &&
      r.batch === session.batch
  );
  
  if (existingRecord) {
    throw new Error('Attendance already marked for this lecture');
  }
  
  const record: AttendanceRecord = {
    id: crypto.randomUUID(),
    studentId: student.id,
    studentPrn: student.prn,
    studentName: student.fullName,
    subject: session.subject,
    division: session.division,
    batch: session.batch,
    teacherId: session.teacherId,
    date: today,
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    timestamp: now,
  };
  
  records.push(record);
  setItem(STORAGE_KEYS.ATTENDANCE_RECORDS, records);
  
  return record;
};

export const getStudentAttendanceCount = (prn: string, subject: string): number => {
  const records = getAttendanceRecords();
  return records.filter(r => r.studentPrn === prn && r.subject === subject).length;
};

export const getAttendanceByFilters = (filters: {
  subject?: string;
  division?: string;
  batch?: string;
  date?: string;
}): AttendanceRecord[] => {
  let records = getAttendanceRecords();
  
  if (filters.subject) {
    records = records.filter(r => r.subject === filters.subject);
  }
  if (filters.division) {
    records = records.filter(r => r.division === filters.division);
  }
  if (filters.batch) {
    records = records.filter(r => r.batch === filters.batch);
  }
  if (filters.date) {
    records = records.filter(r => r.date === filters.date);
  }
  
  return records;
};

// Initialize storage on module load
initializeStorage();
