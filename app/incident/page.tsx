'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';

const gradeDivisions: { [key: string]: string[] } = {
  G1: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  G2: ['A', 'B', 'C', 'D', 'E', 'F'],
  G3: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  G4: ['G'],
};

const grades = Object.keys(gradeDivisions);

export default function IncidentPage() {
  const [grade, setGrade] = useState('');
  const [division, setDivision] = useState('');
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [incident, setIncident] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [incidentTypes, setIncidentTypes] = useState<string[]>([]);
  const [newIncident, setNewIncident] = useState('');

  const divisions = grade ? gradeDivisions[grade] || [] : [];

  useEffect(() => {
    const saved = localStorage.getItem('incidentTypes');
    if (saved) {
      setIncidentTypes(JSON.parse(saved));
    } else {
      setIncidentTypes([
        'Injury',
        'Fall',
        'Fainted',
        'Bleeding',
        'Sprain',
        'Aggressive behavior',
        'Emergency evacuation',
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('incidentTypes', JSON.stringify(incidentTypes));
  }, [incidentTypes]);

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
    if (!studentId || !incident) {
      alert('Please fill all required fields');
      return;
    }

    const res = await fetch('/api/save-incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        grade,
        division,
        incident,
        notes,
        date: new Date().toISOString().split('T')[0],
      }),
    });

    if (res.ok) {
      alert('Incident saved');
      setStudentId('');
      setIncident('');
      setNotes('');
    } else {
      alert('Error saving incident');
    }
  };

  const handleAddIncident = () => {
    const name = newIncident.trim();
    if (!name) return;
    if (!incidentTypes.includes(name)) {
      setIncidentTypes((prev) => [...prev, name]);
    }
    setNewIncident('');
  };

  return (
    <>
      <Box sx={{ backgroundColor: 'primary.main', color: '#fff', px: 3, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Incident
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
          <InputLabel>Incident</InputLabel>
          <Select value={incident} label="Incident" onChange={(e) => setIncident(e.target.value)}>
            {incidentTypes.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Add New Incident"
            fullWidth
            value={newIncident}
            onChange={(e) => setNewIncident(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleAddIncident}>
            Save
          </Button>
        </Stack>

        <TextField
          label="Notes"
          fullWidth
          multiline
          minRows={3}
          sx={{ mb: 3 }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ height: '56px' }}
          onClick={handleSubmit}
        >
          Save Incident
        </Button>
      </Box>
    </>
  );
}
