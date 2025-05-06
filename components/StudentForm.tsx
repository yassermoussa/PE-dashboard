'use client';

import { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

export default function StudentForm() {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        class: className,
        age: Number(age),
      }),
    });

    if (res.ok) {
      setName('');
      setClassName('');
      setAge('');
      alert('تم حفظ الطالب');
    } else {
      alert('فيه مشكلة، حاول تاني');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
      <TextField label="اسم الطالب" value={name} onChange={(e) => setName(e.target.value)} required />
      <TextField label="الفصل" value={className} onChange={(e) => setClassName(e.target.value)} required />
      <TextField label="السن" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
      <Button type="submit" variant="contained">حفظ</Button>
    </Box>
  );
}
