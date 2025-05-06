'use client';

import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import TodayIcon from '@mui/icons-material/Today';
import WarningIcon from '@mui/icons-material/ReportProblem';
import StarIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(0);

  useEffect(() => {
    switch (pathname) {
      case '/':
        setValue(0);
        break;
      case '/attendance':
        setValue(1);
        break;
      case '/incident':
        setValue(2);
        break;
      case '/performance':
        setValue(3);
        break;
      case '/profile':
        setValue(4);
        break;
    }
  }, [pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    const paths = ['/', '/attendance', '/incident', '/performance', '/profile'];
    router.push(paths[newValue]);
  };

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={8}>
      <BottomNavigation value={value} onChange={handleChange} showLabels>
        <BottomNavigationAction label="Home" icon={<HomeIcon />} sx={value === 0 ? { fontWeight: 'bold' } : {}} />
        <BottomNavigationAction label="Attendance" icon={<TodayIcon />} sx={value === 1 ? { fontWeight: 'bold' } : {}} />
        <BottomNavigationAction label="Incident" icon={<WarningIcon />} sx={value === 2 ? { fontWeight: 'bold' } : {}} />
        <BottomNavigationAction label="Performance" icon={<StarIcon />} sx={value === 3 ? { fontWeight: 'bold' } : {}} />
        <BottomNavigationAction label="Profile" icon={<PersonIcon />} sx={value === 4 ? { fontWeight: 'bold' } : {}} />
      </BottomNavigation>
    </Paper>
  );
}
