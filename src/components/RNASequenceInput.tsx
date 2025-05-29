import React, { useState } from 'react';
import {
    TextField,
    Button,
    Box,
    Typography,
    Paper,
    Stack,
    Input,
} from '@mui/material';
import { validateSequence } from '../services/api';

interface RNASequenceInputProps {
    onSubmit: (sequence: string) => void;
    isLoading?: boolean;
    value?: string;
    onChange?: (value: string) => void;
}

const EXAMPLE_SEQUENCE = 'AUGGCUAACGUUAGCUAGCUUAGGGAUUUCCCGGGAAAUUU';

function extractFastaSequence(input: string): string {
    // Remove FASTA header and join lines
    return input
        .replace(/^>.*\n/, '')
        .replace(/\s+/g, '')
        .toUpperCase();
}

export const RNASequenceInput: React.FC<RNASequenceInputProps> = ({
    onSubmit,
    isLoading = false,
    value,
    onChange,
}) => {
    const [internalSequence, setInternalSequence] = useState('');
    const sequence = value !== undefined ? value : internalSequence;
    const setSequence = onChange || setInternalSequence;
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (value: string) => {
        let seq = value;
        // If pasted FASTA, extract sequence
        if (seq.startsWith('>') || seq.includes('\n')) {
            seq = extractFastaSequence(seq);
        }
        setSequence(seq);
        if (!validateSequence(seq) && seq.length > 0) {
            setError('Invalid sequence! Please use only A, C, G, and U nucleotides.');
        } else {
            setError(null);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            handleInputChange(text);
        };
        reader.readAsText(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const upperSequence = sequence.toUpperCase();
        if (!validateSequence(upperSequence)) {
            setError('Invalid sequence! Please use only A, C, G, and U nucleotides.');
            return;
        }
        setError(null);
        onSubmit(upperSequence);
    };

    const handlePasteExample = () => {
        setSequence(EXAMPLE_SEQUENCE);
        setError(null);
    };

    const handleClear = () => {
        setSequence('');
        setError(null);
    };

    const lengthWarning =
        sequence.length > 0 && sequence.length < 10
            ? 'Sequence is very short (less than 10 nt).'
            : sequence.length > 2000
            ? 'Sequence is very long (over 2000 nt).'
            : '';

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Enter RNA Sequence
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    label="RNA Sequence or FASTA"
                    value={sequence}
                    onChange={(e) => handleInputChange(e.target.value)}
                    error={!!error}
                    helperText={
                        error ||
                        lengthWarning ||
                        `Enter a valid RNA sequence using only A, C, G, and U nucleotides. Length: ${sequence.length}`
                    }
                    disabled={isLoading}
                    sx={{ mb: 2 }}
                />
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handlePasteExample}
                        disabled={isLoading}
                    >
                        Paste Example
                    </Button>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleClear}
                        disabled={isLoading || !sequence}
                    >
                        Clear
                    </Button>
                    <Button
                        variant="outlined"
                        component="label"
                        color="primary"
                        disabled={isLoading}
                    >
                        Upload FASTA
                        <Input
                            type="file"
                            inputProps={{ accept: '.fa,.fasta,.txt' }}
                            onChange={handleFileUpload}
                            sx={{ display: 'none' }}
                        />
                    </Button>
                </Stack>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isLoading || !sequence || !!error}
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Sequence'}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
}; 