import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails, Link } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const steps = [
  'Paste or upload your RNA sequence (A, C, G, U only).',
  'Click "Analyze Sequence" to predict structure and motifs.',
  'Explore results in the visualization and designer tabs.',
  'Export, download, or further analyze as needed.',
];

const faqs = [
  { q: 'What types of RNA sequences are supported?', a: 'Any sequence using A, C, G, and U nucleotides. Both short and long RNAs are supported.' },
  { q: 'Is my data private?', a: 'Yes! All analysis runs in your browser or on your machine. No sequences are shared unless you choose to.' },
  { q: 'Can I contribute or suggest features?', a: 'Absolutely! RiboStructAI is open-source. Visit our GitHub or contact us.' },
];

export const HelpPage: React.FC = () => (
  <Box sx={{ mt: 4, mb: 4 }}>
    <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Help & FAQ
      </Typography>
      <Typography variant="h5" component="h2" sx={{ mt: 2, mb: 1 }}>
        How to Use RiboStructAI
      </Typography>
      <List>
        {steps.map((step, i) => (
          <ListItem key={i}>
            <ListItemText primary={`${i + 1}. ${step}`} />
          </ListItem>
        ))}
      </List>
      <Typography variant="h5" component="h2" sx={{ mt: 3, mb: 1 }}>
        Frequently Asked Questions
      </Typography>
      {faqs.map((faq, i) => (
        <Accordion key={i}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{faq.q}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{faq.a}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        Still need help? Email us at <Link href="mailto:contact@ribostructai.org">contact@ribostructai.org</Link>
      </Typography>
    </Paper>
  </Box>
); 