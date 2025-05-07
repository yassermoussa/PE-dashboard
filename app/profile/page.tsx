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
  Button,
} from '@mui/material';
import React from 'react';
import { useEffect, useState, useRef } from 'react';
//@ts-ignore
import html2pdf from 'html2pdf.js';
// @ts-ignore
import * as XLSX from 'xlsx';
// @ts-ignore
import { saveAs } from 'file-saver';
import FileDownloadIcon from '@mui/icons-material/FileDownload';


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
  const contentRef = useRef(null);

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

  const exportPDF = async () => {
    if (!contentRef.current) return;
  
    const html2pdf = (await import('html2pdf.js')).default;
  
    html2pdf().from(contentRef.current).save('profile.pdf');
  };
  

  const exportExcel = () => {
    if (!profileData) return;
    const data = profileData.attendance.map((entry: any) => ({
      Date: entry.date,
      Status: entry.status,
      Notes: entry.notes?.join(', '),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'profile.xlsx');
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
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Profile
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={exportPDF}
              startIcon={<FileDownloadIcon />}
              sx={{ color: '#fff', borderColor: '#fff' }}
            >
              PDF
            </Button>
            <Button
              variant="outlined"
              onClick={exportExcel}
              startIcon={<FileDownloadIcon />}
              sx={{ color: '#fff', borderColor: '#fff' }}
            >
              Excel
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 3, paddingBottom: 10 }} ref={contentRef}>
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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {[{ label: 'Present', value: profileData.presentCount, bg: '#e8f5e9' },
                  { label: 'Absent', value: profileData.absentCount, bg: '#ffebee' },
                  { label: 'Late', value: profileData.lateCount, bg: '#fff8e1' },
                  { label: 'Excused', value: profileData.excusedCount, bg: '#e3f2fd' },
                  { label: 'Notes', value: profileData.notesCount, bg: '#f3e5f5' }
                ].map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: '100px',
                      p: 2,
                      textAlign: 'center',
                      backgroundColor: item.bg,
                      borderRadius: 2,
                      boxShadow: 2,
                    }}
                  >
                    <Typography fontWeight="bold">{item.label}</Typography>
                    <Typography fontSize={20}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>
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

            <Paper sx={{ p: 2, mb: 2 }}>
  <Typography fontWeight="bold" gutterBottom>
    Incident Reports
  </Typography>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Date</TableCell>
        <TableCell>Type</TableCell>
        <TableCell>Note</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {profileData.incident.map((i: any, idx: number) => (
        <TableRow key={idx}>
          <TableCell>{i.date}</TableCell>
          <TableCell>{i.incident_type}</TableCell>
          <TableCell>{i.note}</TableCell>
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
