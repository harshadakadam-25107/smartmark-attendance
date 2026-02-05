import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, BookOpen, Users, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { getAttendanceByFilters } from '@/lib/storage';
import { AttendanceRecord, DIVISIONS, BATCHES } from '@/types/attendance';

const TeacherReports: React.FC = () => {
  const navigate = useNavigate();
  const { teacher, isAuthenticated } = useAuth();
  
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/teacher/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const filters: {
      subject?: string;
      division?: string;
      batch?: string;
      date?: string;
    } = {};
    
    if (filterSubject) filters.subject = filterSubject;
    if (filterDivision) filters.division = filterDivision;
    if (filterBatch) filters.batch = filterBatch;
    if (filterDate) filters.date = filterDate;

    const filteredRecords = getAttendanceByFilters(filters);
    setRecords(filteredRecords.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  }, [filterSubject, filterDivision, filterBatch, filterDate]);

  const exportToCSV = () => {
    if (records.length === 0) return;

    const headers = ['PRN', 'Name', 'Subject', 'Division', 'Batch', 'Date', 'Time'];
    const csvContent = [
      headers.join(','),
      ...records.map(r => 
        [r.studentPrn, r.studentName, r.subject, r.division, r.batch, r.date, r.time].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!teacher) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Attendance Reports</h1>
          </div>
          <Button
            onClick={exportToCSV}
            disabled={records.length === 0}
            className="rounded-xl gradient-primary text-primary-foreground"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Filters */}
          <div className="bg-card rounded-2xl p-6 shadow-card animate-slide-up">
            <h2 className="text-lg font-semibold text-foreground mb-4">Filters</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Subject */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-foreground text-sm">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  Subject
                </Label>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="h-10 rounded-xl bg-muted border-0">
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subjects</SelectItem>
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
                <Label className="flex items-center gap-2 text-foreground text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Division
                </Label>
                <Select value={filterDivision} onValueChange={setFilterDivision}>
                  <SelectTrigger className="h-10 rounded-xl bg-muted border-0">
                    <SelectValue placeholder="All divisions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All divisions</SelectItem>
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
                <Label className="flex items-center gap-2 text-foreground text-sm">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  Batch
                </Label>
                <Select value={filterBatch} onValueChange={setFilterBatch}>
                  <SelectTrigger className="h-10 rounded-xl bg-muted border-0">
                    <SelectValue placeholder="All batches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All batches</SelectItem>
                    {BATCHES.map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        Batch {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-foreground text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Date
                </Label>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="h-10 rounded-xl bg-muted border-0"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-card rounded-2xl shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">
                {records.length} Records Found
              </h3>
            </div>
            
            {records.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PRN</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.studentPrn}</TableCell>
                        <TableCell>{record.studentName}</TableCell>
                        <TableCell>{record.subject}</TableCell>
                        <TableCell>{record.division}</TableCell>
                        <TableCell>{record.batch}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No attendance records found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherReports;
