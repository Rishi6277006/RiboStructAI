import React from 'react';
import { AppBar, Toolbar, Typography, Box, Link, IconButton, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import logo from '../assets/logo.svg';
import { Link as RouterLink } from 'react-router-dom';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode }) => {
  const theme = useTheme();
  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img src={logo} alt="RiboStructAI Logo" style={{ height: 36, marginRight: 12 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            RiboStructAI
          </Typography>
        </Box>
        <Box>
          <Link component={RouterLink} to="/" color="inherit" underline="none" sx={{ mx: 2 }}>
            Home
          </Link>
          <Link component={RouterLink} to="/about" color="inherit" underline="none" sx={{ mx: 2 }}>
            About
          </Link>
          <Link component={RouterLink} to="/help" color="inherit" underline="none" sx={{ mx: 2 }}>
            Help
          </Link>
        </Box>
        <IconButton sx={{ ml: 2 }} onClick={onToggleDarkMode} color="inherit" title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}; 