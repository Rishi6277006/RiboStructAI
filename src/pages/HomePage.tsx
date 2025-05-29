import React, { useState, useRef } from 'react';
import {
    Box,
    Typography,
    Alert,
    CircularProgress,
    useTheme,
    Button,
} from '@mui/material';
import { RNASequenceInput } from '../components/RNASequenceInput';
import { RNAStructureVisualization } from '../components/RNAStructureVisualization';
import { BindingSitePrediction } from '../components/BindingSitePrediction';
import { NERAnalysis } from '../components/NERAnalysis';
import { analyzeRNASequence } from '../services/api';
import { RNASequenceAnalysis, BindingSite } from '../types';
import { ReactComponent as RnaHero } from '../assets/rna_hero.svg';
import { HeroParticles } from '../components/HeroParticles';
import { OnboardingTour } from '../components/OnboardingTour';
import { FeaturedAnalyses } from '../components/FeaturedAnalyses';

export const HomePage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<RNASequenceAnalysis | null>(null);
    const [bindingSites, setBindingSites] = useState<BindingSite[]>([]);
    const theme = useTheme();
    const inputRef = useRef<HTMLDivElement>(null);
    const [showTour, setShowTour] = useState(() => {
        return sessionStorage.getItem('ribostructai_tour_shown') !== '1';
    });
    const [inputValue, setInputValue] = useState('');

    const handleAnalyze = async (sequence: string) => {
        setIsLoading(true);
        setError(null);
        setBindingSites([]); // Clear binding sites on new analysis

        try {
            const response = await analyzeRNASequence(sequence);
            if (response.status === 'error') {
                setError(response.error || 'An error occurred during analysis');
                return;
            }
            if (response.data) {
                setAnalysis(response.data);
            } else {
                setError('No analysis data received');
            }
        } catch (err) {
            setError('Failed to analyze sequence. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseTour = () => {
        setShowTour(false);
        sessionStorage.setItem('ribostructai_tour_shown', '1');
    };

    const handleTryExample = (seq: string) => {
        setInputValue(seq);
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <Box>
            <OnboardingTour open={showTour} onClose={handleCloseTour} />
            {/* Hero Section */}
            <Box
                className="section-fade"
                role="region"
                aria-label="AI-powered RNA design and analysis hero section"
                sx={{
                    width: '100%',
                    minHeight: 260,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor:
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(90deg, #23272a 0%, #00575a 100%)'
                            : 'linear-gradient(90deg, #4dd0e1 0%, #008080 100%)',
                    borderRadius: 4,
                    boxShadow: 3,
                    mb: 5,
                    px: { xs: 2, md: 6 },
                    py: { xs: 4, md: 6 },
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Animated background particles */}
                <HeroParticles />
                <Box sx={{ flex: 1, zIndex: 2 }}>
                    <Typography
                        variant="h2"
                        component="h1"
                        role="heading"
                        aria-level={1}
                        sx={{
                            color: theme.palette.mode === 'dark' ? '#e0f7fa' : '#00332e',
                            fontWeight: 700,
                            mb: 2,
                            letterSpacing: 1,
                            textShadow: theme.palette.mode === 'dark' ? '0 2px 8px #0006' : '0 2px 8px #fff8',
                        }}
                    >
                        AI-Powered RNA Design & Analysis
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            color: theme.palette.mode === 'dark' ? '#b2ebf2' : '#004d43',
                            mb: 3,
                            maxWidth: 500,
                            textShadow: theme.palette.mode === 'dark' ? '0 1px 6px #0004' : '0 1px 6px #fff8',
                        }}
                    >
                        Predict, visualize, and design RNA sequences with deep learning and interactive tools. Discover motifs, structures, and more—all in your browser.
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        sx={{ mt: 2, fontWeight: 700, borderRadius: 3, boxShadow: 2 }}
                        onClick={() => {
                            inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        aria-label="Get started with RNA analysis"
                    >
                        Get Started
                    </Button>
                </Box>
                <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', zIndex: 1 }}>
                    {/* Hero SVG illustration (add your own or use a placeholder) */}
                    <RnaHero style={{ width: 220, height: 220, opacity: theme.palette.mode === 'dark' ? 0.8 : 0.9 }} aria-hidden="true" tabIndex={-1} />
                </Box>
                {/* Decorative background shapes */}
                <Box sx={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, bgcolor: theme.palette.mode === 'dark' ? '#fff' : '#fff', opacity: theme.palette.mode === 'dark' ? 0.04 : 0.08, borderRadius: '50%' }} tabIndex={-1} aria-hidden="true" />
                <Box sx={{ position: 'absolute', bottom: -40, left: -40, width: 120, height: 120, bgcolor: theme.palette.mode === 'dark' ? '#fff' : '#fff', opacity: theme.palette.mode === 'dark' ? 0.03 : 0.06, borderRadius: '50%' }} tabIndex={-1} aria-hidden="true" />
            </Box>
            {/* Featured Analyses Section */}
            <FeaturedAnalyses onTryExample={handleTryExample} />
            {/* Main content */}
            <Box ref={inputRef} className="section-fade" />
            <Typography variant="h4" component="h1" gutterBottom>
                RNA Structure Prediction & Drug Discovery
            </Typography>
            <Typography variant="body1" paragraph>
                Enter an RNA sequence to predict its secondary structure and identify potential small-molecule binding sites.
            </Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} aria-live="polite">
                    {error}
                </Alert>
            )}
            <RNASequenceInput onSubmit={handleAnalyze} isLoading={isLoading} value={inputValue} onChange={setInputValue} />

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }} aria-live="polite">
                    <CircularProgress />
                </Box>
            )}

            {analysis && !isLoading && (
                <>
                    <RNAStructureVisualization analysis={analysis} bindingSites={bindingSites} />
                    <NERAnalysis sequence={analysis.sequence.sequence} />
                    <BindingSitePrediction sequence={analysis.sequence.sequence} bindingSites={bindingSites} onBindingSites={setBindingSites} />
                </>
            )}
        </Box>
    );
}; 