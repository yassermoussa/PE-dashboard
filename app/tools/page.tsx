'use client';

import { Box, Button, Typography } from '@mui/material';

export default function ToolsPage() {
  const handleImport = async () => {
    const res = await fetch('/api/import-students', {
      method: 'POST',
    });

    const data = await res.json();
    alert(`Inserted ${data.inserted} students`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Developer Tools
      </Typography>
      <Button variant="contained" color="primary" onClick={handleImport}>
        Import Student List
      </Button>
    </Box>
  );
}
