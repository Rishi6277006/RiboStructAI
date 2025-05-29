import React, { useState } from 'react';
import { Box, Button, Dialog, DialogContent, DialogActions, Typography, MobileStepper, Paper } from '@mui/material';

const steps = [
  {
    label: 'Welcome to RiboStructAI!',
    description: 'This app lets you predict, visualize, and design RNA structures using AI. Let\'s take a quick tour!',
  },
  {
    label: 'Hero Section',
    description: 'Start here! The hero section introduces the app and lets you quickly get started.',
  },
  {
    label: 'Input Form',
    description: 'Paste or upload your RNA sequence and click Analyze to begin.',
  },
  {
    label: 'Visualization',
    description: 'Explore predicted structures, motifs, and use the RNA Designer tab for generative design.',
  },
];

export const OnboardingTour: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = steps.length;

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, maxSteps - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="onboarding-tour-title" maxWidth="sm" fullWidth>
      <DialogContent>
        <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" id="onboarding-tour-title" gutterBottom>
            {steps[activeStep].label}
          </Typography>
          <Typography variant="body1">{steps[activeStep].description}</Typography>
        </Paper>
        <MobileStepper
          variant="dots"
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          nextButton={
            <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1} aria-label="Next step">
              Next
            </Button>
          }
          backButton={
            <Button size="small" onClick={handleBack} disabled={activeStep === 0} aria-label="Previous step">
              Back
            </Button>
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" aria-label="Close tour">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 