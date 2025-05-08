'use client';

import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  IconButton,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PercentIcon from '@mui/icons-material/Percent';
import VerifiedIcon from '@mui/icons-material/Verified';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';

interface Note {
  text: string;
  date: string;
}

export default function HomePage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [teacher, setTeacher] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const router = useRouter();

  useEffect(() => {
    const logged = localStorage.getItem('teacher');
    if (!logged) {
      router.push('/login');
    } else {
      setTeacher(logged);
    }

    const savedNotes = localStorage.getItem('dashboard_notes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      fetch('/api/home-summary', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          setSummary(data);
          setLoading(false);
        });
    };

    // Call fetchData immediately on mount
    fetchData();

    // Set interval to call fetchData every minute (60000 ms)
    const interval = setInterval(fetchData, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    const newNote: Note = {
      text: noteInput.trim(),
      date: new Date().toLocaleString(),
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('dashboard_notes', JSON.stringify(updatedNotes));
    setNoteInput('');
  };

  const deleteNote = (index: number) => {
    const updated = [...notes];
    updated.splice(index, 1);
    setNotes(updated);
    localStorage.setItem('dashboard_notes', JSON.stringify(updated));
  };

  // Remove duplicates based on student name
  const getUniqueTopAbsentStudents = (students: any[]) => {
    const seen = new Set();
    return students.filter((student) => {
      if (seen.has(student.name)) {
        return false;
      }
      seen.add(student.name);
      return true;
    });
  };

  return (
    <>
      <Box sx={{ backgroundColor: 'primary.main', color: '#fff', px: 3, py: 2 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Home
            </Typography>
          </Grid>
          <Grid>
            <Button
              variant="outlined"
              size="small"
              sx={{ color: '#fff', borderColor: '#fff' }}
              onClick={() => {
                localStorage.removeItem('teacher');
                router.push('/login');
              }}
            >
              Logout
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ p: 3, paddingBottom: 10 }}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            mb: 3,
            borderRadius: 2,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Welcome, {teacher}
            </Typography>
            <VerifiedIcon color="primary" />
          </Box>

          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={async () => {
              if (confirm('Are you sure you want to reset all data?')) {
                try {
                  const res = await fetch('/api/reset', { method: 'POST' });

                  if (res.ok) {
                    alert('All data reset');
                    window.location.reload(); // Reload to reflect changes
                  } else {
                    const errorMessage = await res.text(); // Capture error response
                    console.log("Reset failed:", errorMessage);
                    alert('Reset failed: ' + errorMessage);
                  }
                } catch (error) {
                  console.log('Error during reset:', error); // Log error details
                  alert('Reset failed: Unknown error occurred');

                }
              }
            }}
          >
            Reset All Data
          </Button>
        </Paper>

        {loading && <CircularProgress />}

        {!loading && summary && (
          <>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {[{ label: 'Total Students', value: summary.totalStudents, icon: <GroupsIcon sx={{ fontSize: 36, color: '#2196f3' }} />, bg: '#e3f2fd' },
                { label: 'Present', value: summary.totalPresent, icon: <CheckCircleIcon sx={{ fontSize: 36, color: '#4caf50' }} />, bg: '#e8f5e9' },
                { label: 'Absent', value: summary.totalAbsent, icon: <CancelIcon sx={{ fontSize: 36, color: '#f44336' }} />, bg: '#ffebee' },
                { label: 'Attendance %', value: `${summary.attendancePercentage}%`, icon: <PercentIcon sx={{ fontSize: 36, color: '#ff9800' }} />, bg: '#fff8e1' },
                { label: 'Weekly Incidents', value: summary.weeklyIncidents, icon: <CancelIcon sx={{ fontSize: 36, color: '#9c27b0' }} />, bg: '#f3e5f5', sub: `${summary.weekStart} → ${summary.weekEnd}` },
                { label: 'Monthly Incidents', value: summary.monthlyIncidents, icon: <CancelIcon sx={{ fontSize: 36, color: '#3f51b5' }} />, bg: '#e8eaf6', sub: summary.monthName }
              ].map((card, i) => (
                <Grid key={i} sx={{ display: 'flex' }}>
                  <Paper
                    sx={{
                      width: '100%',
                      minHeight: 130,
                      p: 2,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: card.bg,
                    }}
                  >
                    {card.icon}
                    <Typography fontWeight="bold">{card.label}</Typography>
                    <Typography fontSize={20}>{card.value}</Typography>
                    {card.sub && (
                      <Typography fontSize={12} color="gray">
                        {card.sub}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {summary.highAbsenceAlerts?.length > 0 && (
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  backgroundColor: '#fff3e0',
                  borderLeft: '5px solid #ff9800',
                }}
              >
                <Typography fontWeight="bold" sx={{ mb: 1 }}>
                  ⚠️ Students with 5 or more absences
                </Typography>
                {getUniqueTopAbsentStudents(summary.highAbsenceAlerts).map((s: any, idx: number) => (
                  <Typography key={idx} sx={{ ml: 1 }}>
                    • {s.name} (Grade {s.grade}, Division {s.division}) - {s.absent_count} absences
                  </Typography>
                ))}
              </Paper>
            )}

            <Paper sx={{ mb: 4, p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Top Absent Students
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Division</TableCell>
                    <TableCell>Absent Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getUniqueTopAbsentStudents(summary.topAbsentStudents).map((s: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.grade}</TableCell>
                      <TableCell>{s.division}</TableCell>
                      <TableCell>{s.absent_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </>
        )}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Reminders
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TextField
              label="New note"
              multiline
              rows={1}
              maxRows={2}
              fullWidth
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              inputProps={{ style: { fontSize: '14px' } }}
            />
            <Button
              variant="contained"
              onClick={handleSaveNote}
              sx={{ height: '56px', whiteSpace: 'nowrap' }}
            >
              Save
            </Button>
          </Box>

          {notes.map((note, idx) => (
            <Paper
              key={idx}
              sx={{
                p: 2,
                mb: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography fontSize={14} color="text.secondary">
                  {note.date}
                </Typography>
                <Typography>{note.text}</Typography>
              </Box>
              <IconButton onClick={() => deleteNote(idx)}>
                <DeleteIcon />
              </IconButton>
            </Paper>
          ))}
        </Paper>
      </Box>
    </>
  );
}
