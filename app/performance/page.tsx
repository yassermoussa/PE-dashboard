'use client';

import { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  TextField,
  Stack,
} from '@mui/material';

const gradeDivisions: { [key: string]: string[] } = {
  G1: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  G2: ['A', 'B', 'C', 'D', 'E', 'F'],
  G3: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  G4: ['G'],
};

const grades = Object.keys(gradeDivisions);

export default function PerformancePage() {
  const [grade, setGrade] = useState('');
  const [division, setDivision] = useState('');
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [testType, setTestType] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableTests, setAvailableTests] = useState<string[]>([]);
  const [newTest, setNewTest] = useState('');

  const divisions = grade ? gradeDivisions[grade] || [] : [];

  useEffect(() => {
    const saved = localStorage.getItem('performanceTests');
    if (saved) {
      setAvailableTests(JSON.parse(saved));
    } else {
      setAvailableTests([
        'Push-ups',
        'Sit-ups',
        'Sprint Time',
        'Jump Distance',
        'Agility Test',
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('performanceTests', JSON.stringify(availableTests));
  }, [availableTests]);

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
          setLoading(false);
        });
    }
  }, [grade, division]);

  const handleSubmit = async () => {
    if (!studentId || !testType || !result) {
      alert('Fill all fields');
      return;
    }

    const res = await fetch('/api/save-performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        grade,
        division,
        test_type: testType,
        result,
        date: new Date().toISOString().split('T')[0],
      }),
    });

    if (res.ok) {
      alert('Saved');
      setStudentId('');
      setTestType('');
      setResult('');
    } else {
      alert('Error saving');
    }
  };

  const handleAddTest = () => {
    const name = newTest.trim();
    if (!name) return;
    if (!availableTests.includes(name)) {
      setAvailableTests((prev) => [...prev, name]);
    }
    setNewTest('');
  };

  return (
    <>
      <Box sx={{ backgroundColor: 'primary.main', color: '#fff', px: 3, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Performance Test
        </Typography>
      </Box>

      <Box sx={{ p: 3, pb: 10 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Grade</InputLabel>
          <Select value={grade} label="Grade" onChange={(e) => setGrade(e.target.value)}>
            {grades.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }} disabled={!grade}>
          <InputLabel>Division</InputLabel>
          <Select value={division} label="Division" onChange={(e) => setDivision(e.target.value)}>
            {divisions.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading && <CircularProgress sx={{ my: 2 }} />}

        {!loading && students.length > 0 && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Student</InputLabel>
            <Select value={studentId} label="Student" onChange={(e) => setStudentId(e.target.value)}>
              {students.map((s: any) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Test Type</InputLabel>
          <Select value={testType} label="Test Type" onChange={(e) => setTestType(e.target.value)}>
            {availableTests.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Add New Test"
            fullWidth
            value={newTest}
            onChange={(e) => setNewTest(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleAddTest}>
            Save
          </Button>
        </Stack>

        <TextField
          label="Result"
          fullWidth
          sx={{ mb: 3 }}
          value={result}
          onChange={(e) => setResult(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ height: '56px' }}
          onClick={handleSubmit}
        >
          Save Performance
        </Button>
      </Box>
    </>
  );
}
