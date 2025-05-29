import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import PublicIcon from '@mui/icons-material/Public';
import BoltIcon from '@mui/icons-material/Bolt';

const features = [
  { icon: <BoltIcon color="primary" />, text: 'AI-powered RNA structure prediction and motif discovery' },
  { icon: <ScienceIcon color="secondary" />, text: 'Interactive secondary structure visualization' },
  { icon: <PublicIcon color="success" />, text: 'Open-source, community-driven, and privacy-respecting' },
  { icon: <BoltIcon color="warning" />, text: 'Generative RNA design with deep learning' },
];

export const AboutPage: React.FC = () => (
  <Box sx={{ mt: 4, mb: 4 }}>
    <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        About RiboStructAI
      </Typography>
      <Typography variant="body1" paragraph>
        <b>RiboStructAI</b> is an open-source platform dedicated to making RNA structure prediction, motif discovery, and generative design accessible to everyone. Our mission is to empower researchers, students, and enthusiasts with cutting-edge AI tools for RNA science—right in your browser.
      </Typography>
      <Typography variant="h5" component="h2" sx={{ mt: 3, mb: 1 }}>
        Key Features
      </Typography>
      <List>
        {features.map((f, i) => (
          <ListItem key={i}>
            <ListItemIcon>{f.icon}</ListItemIcon>
            <ListItemText primary={f.text} />
          </ListItem>
        ))}
      </List>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        RiboStructAI is built by a passionate community of scientists and engineers. We believe in open science, transparency, and the power of AI to accelerate discovery. Contributions are welcome!
      </Typography>
    </Paper>
  </Box>
); 