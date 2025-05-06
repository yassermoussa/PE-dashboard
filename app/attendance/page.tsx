// ✅ Updated with alert system

'use client';

import { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';

const gradeDivisions: { [key: string]: string[] } = {
  G1: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  G2: ['A', 'B', 'C', 'D', 'E', 'F'],
  G3: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  G4: ['G'],
};

const grades = Object.keys(gradeDivisions);
const attendanceOptions = ['present', 'absent', 'late', 'excused'];
const attendanceLabels: { [key: string]: string } = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
};

export default function AttendancePage() {
  const [grade, setGrade] = useState('');
  const [division, setDivision] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
  const [notes, setNotes] = useState<{ [key: string]: string[] }>({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertStudent, setAlertStudent] = useState('');

  const handleGradeChange = (e: any) => setGrade(e.target.value);
  const handleDivisionChange = (e: any) => setDivision(e.target.value);
  const divisions = grade ? gradeDivisions[grade] || [] : [];

  useEffect(() => {
    if (grade && division) {
      setLoading(true);
      fetch(`/api/students?grade=${grade}&division=${division}`)
        .then((res) => res.json())
        .then((data) => {
          const unique = data.filter(
            (s: any, index: number, self: any[]) =>
              index === self.findIndex((x) => x.name === s.name)
          );
          setStudents(unique);

          const initialAttendance: any = {};
          const initialNotes: any = {};
          unique.forEach((student: any) => {
            initialAttendance[student._id] = '';
            initialNotes[student._id] = [];
          });
          setAttendance(initialAttendance);
          setNotes(initialNotes);
          setLoading(false);
        });
    }
  }, [grade, division]);

  const markAttendance = (id: string, status: string) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: prev[id] === status ? '' : status,
    }));
  };

  const toggleNote = (id: string, note: string) => {
    setNotes((prev) => {
      const current = prev[id] || [];
      if (current.includes(note)) {
        return { ...prev, [id]: current.filter((n) => n !== note) };
      } else {
        return { ...prev, [id]: [...current, note] };
      }
    });
  };

  const handleSave = async () => {
    const selectedStudents = students.filter((s: any) => attendance[s._id]);
    if (selectedStudents.length === 0) {
      alert('Please mark at least one student before saving');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const payload = selectedStudents.map((s: any) => ({
      studentId: s._id,
      grade,
      division,
      date: today,
      status: attendance[s._id],
      notes: notes[s._id] || [],
    }));

    const res = await fetch('/api/save-attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok) {
      alert('Attendance saved successfully');

      const clearedAttendance: any = {};
      const clearedNotes: any = {};
      students.forEach((s: any) => {
        clearedAttendance[s._id] = '';
        clearedNotes[s._id] = [];
      });
      setAttendance(clearedAttendance);
      setNotes(clearedNotes);

      // Alert if any student crossed 3 absences (optional check)
      const absentStudents = payload.filter((r) => r.status === 'absent');
      for (const r of absentStudents) {
        const absencesRes = await fetch(
          `/api/student-absences?id=${r.studentId}`
        );
        const data = await absencesRes.json();
        if (data.count >= 3) {
          const studentName = (students as any[]).find((s) => s._id === r.studentId)?.name;
          setAlertStudent(studentName);
          setAlertOpen(true);
        }
      }
    } else {
      alert('Error saving attendance: ' + result.error);
    }
  };

  return (
    <>
      <Box sx={{ backgroundColor: 'primary.main', color: '#fff', px: 3, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Attendance
        </Typography>
      </Box>

      <Box sx={{ p: 3, paddingBottom: 10 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Grade</InputLabel>
          <Select value={grade} label="Grade" onChange={handleGradeChange}>
            {grades.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Division</InputLabel>
          <Select value={division} label="Division" onChange={handleDivisionChange}>
            {divisions.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading && <CircularProgress />}

        {!loading && students.length > 0 && (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Attendance</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student: any) => (
                  <TableRow key={student._id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {attendanceOptions.map((status) => (
                          <Button
                            key={status}
                            variant={
                              attendance[student._id] === status ? 'contained' : 'outlined'
                            }
                            color={
                              status === 'present'
                                ? 'success'
                                : status === 'absent'
                                ? 'error'
                                : status === 'late'
                                ? 'warning'
                                : 'info'
                            }
                            onClick={() => markAttendance(student._id, status)}
                            sx={{
                              minWidth: 80,
                              maxWidth: 80,
                              fontSize: '12px',
                              padding: '4px 8px',
                            }}
                          >
                            {attendanceLabels[status]}
                          </Button>
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {['NO PE KIT', 'NO SPORT SHOES', 'REFUSE TO PARTICIPATE'].map(
                          (note) => (
                            <Button
                              key={note}
                              size="small"
                              variant={
                                attendance[student._id] === 'present' &&
                                notes[student._id]?.includes(note)
                                  ? 'contained'
                                  : 'outlined'
                              }
                              onClick={() =>
                                attendance[student._id] === 'present' &&
                                toggleNote(student._id, note)
                              }
                              sx={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                visibility:
                                  attendance[student._id] === 'present'
                                    ? 'visible'
                                    : 'hidden',
                              }}
                            >
                              {note}
                            </Button>
                          )
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Box sx={{ textAlign: 'right', mt: 3 }}>
              <Button variant="contained" onClick={handleSave}>
                Save Attendance
              </Button>
            </Box>
          </>
        )}
      </Box>

      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={() => setAlertOpen(false)}>
        <Alert onClose={() => setAlertOpen(false)} severity="warning" sx={{ width: '100%' }}>
          🚨 {alertStudent} has 3 or more absences!
        </Alert>
      </Snackbar>
    </>
  );
}
