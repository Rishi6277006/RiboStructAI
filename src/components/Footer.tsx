import React from 'react';
import { Box, Typography, Link } from '@mui/material';

export const Footer: React.FC = () => (
  <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2, mt: 4, textAlign: 'center' }}>
    <Typography variant="body2">
      &copy; {new Date().getFullYear()} RiboStructAI &mdash;
      <Link href="mailto:contact@ribostructai.org" color="inherit" underline="always" sx={{ ml: 1 }}>
        Contact
      </Link>
    </Typography>
  </Box>
); 