'use client';

import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';


const gradeDivisions: { [key: string]: string[] } = {
  G1: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  G2: ['A', 'B', 'C', 'D', 'E', 'F'],
  G3: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  G4: ['G'],
};

const grades = Object.keys(gradeDivisions);

export default function ProfilePage() {
  const [grade, setGrade] = useState('');
  const [division, setDivision] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGradeChange = (e: any) => {
    setGrade(e.target.value);
    setDivision('');
    setStudents([]);
    setSelectedStudent('');
    setProfileData(null);
  };

  const handleDivisionChange = (e: any) => {
    setDivision(e.target.value);
    setSelectedStudent('');
    setProfileData(null);
  };

  const handleStudentChange = (e: any) => {
    setSelectedStudent(e.target.value);
  };

  useEffect(() => {
    if (grade && division) {
      fetch(`/api/students?grade=${grade}&division=${division}`)
        .then((res) => res.json())
        .then((data) => {
          const unique = data.filter(
            (s: any, index: number, self: any[]) =>
              index === self.findIndex((x) => x.name === s.name)
          );
          setStudents(unique);
        });
    }
  }, [grade, division]);

  useEffect(() => {
    if (selectedStudent) {
      setLoading(true);
      fetch(`/api/student-summary?studentId=${selectedStudent}`)
        .then((res) => res.json())
        .then((data) => {
          setProfileData(data);
          setLoading(false);
        });
    }
  }, [selectedStudent]);

  const divisions = grade ? gradeDivisions[grade] || [] : [];

  return (
    <>
      <Box sx={{ backgroundColor: 'primary.main', color: '#fff', px: 3, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Profile
        </Typography>
      </Box>

      <Box sx={{ p: 3, paddingBottom: 10 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Grade</InputLabel>
          <Select value={grade} label="Grade" onChange={handleGradeChange}>
            {grades.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Division</InputLabel>
          <Select value={division} label="Division" onChange={handleDivisionChange}>
            {divisions.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Student</InputLabel>
          <Select value={selectedStudent} label="Student" onChange={handleStudentChange}>
            {students.map((s: any) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading && <CircularProgress />}

        {!loading && profileData && (
          <>
            <Paper sx={{ p: 2, mb: 2 }}>
  <Typography fontWeight="bold" sx={{ mb: 2 }}>
    Attendance Summary
  </Typography>
  <Grid container spacing={2}>
    {[
      {
        label: 'Present',
        value: profileData.presentCount,
        bg: '#e8f5e9',
      },
      {
        label: 'Absent',
        value: profileData.absentCount,
        bg: '#ffebee',
      },
      {
        label: 'Late',
        value: profileData.lateCount,
        bg: '#fff8e1',
      },
      {
        label: 'Excused',
        value: profileData.excusedCount,
        bg: '#e3f2fd',
      },
      {
        label: 'Notes',
        value: profileData.notesCount,
        bg: '#f3e5f5',
      },
    ].map((item, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
  <Paper
    sx={{
      p: 2,
      textAlign: 'center',
      backgroundColor: item.bg,
      borderRadius: 2,
    }}
  >
    <Typography fontWeight="bold">{item.label}</Typography>
    <Typography fontSize={20}>{item.value}</Typography>
  </Paper>
</Grid>

    ))}
  </Grid>
</Paper>


            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography fontWeight="bold" gutterBottom>
                Attendance Records
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {profileData.attendance.map((a: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{a.date}</TableCell>
                      <TableCell>{a.status}</TableCell>
                      <TableCell>{a.notes?.join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight="bold" gutterBottom>
                Performance Tests
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Test</TableCell>
                    <TableCell>Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {profileData.performance.map((p: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{p.date}</TableCell>
                      <TableCell>{p.test_type}</TableCell>
                      <TableCell>{p.result}</TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </>
        )}
      </Box>
    </>
  );
}
