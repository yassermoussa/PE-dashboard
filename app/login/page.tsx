'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import { useRouter } from 'next/navigation';

const teachers = [
  { username: 'yasser', password: '1234' },
  { username: 'ali', password: '5678' },
  { username: 'sara', password: 'abcd' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem('teacher');
    if (loggedIn) router.push('/');
  }, []);

  const handleLogin = () => {
    const match = teachers.find(
      (t) => t.username === username && t.password === password
    );

    if (match) {
      localStorage.setItem('teacher', match.username);
      router.push('/');
    } else {
      alert('Incorrect username or password');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper sx={{ p: 4, width: 300 }}>
        <Stack spacing={2}>
          <Typography fontWeight="bold" textAlign="center">
            Teacher Login
          </Typography>
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="contained" fullWidth onClick={handleLogin}>
            Sign In
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
