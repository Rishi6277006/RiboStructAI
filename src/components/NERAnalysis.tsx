import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Chip, Stack, Tooltip } from '@mui/material';
import { runNER } from '../services/api';
import { NEREntity } from '../types';

interface NERAnalysisProps {
    sequence: string;
}

// Color map for motif/entity types
const MOTIF_COLORS: Record<string, string> = {
    start_codon: '#1976d2',
    stop_codon: '#d32f2f',
    poly_U: '#fbc02d',
    poly_G: '#388e3c',
    hairpin_loop: '#7b1fa2',
};

const MOTIF_LABELS: Record<string, string> = {
    start_codon: 'Start Codon (AUG)',
    stop_codon: 'Stop Codon (UAA/UAG/UGA)',
    poly_U: 'Poly-U (UUU)',
    poly_G: 'Poly-G (GGG)',
    hairpin_loop: 'Hairpin Loop (GNNNNNCC)',
};

const highlightSequence = (sequence: string, entities: NEREntity[], attention?: number[]) => {
    if (!entities.length && !attention) return sequence;
    // Sort entities by start
    const sorted = [...entities].sort((a, b) => a.start - b.start);
    let result: React.ReactNode[] = [];
    let lastIdx = 0;
    sorted.forEach((entity, idx) => {
        if (entity.start > lastIdx) {
            for (let i = lastIdx; i < entity.start; i++) {
                const att = attention ? attention[i] : 0;
                result.push(
                    <span key={`att-${i}`} style={{ background: `rgba(255,0,0,${att})`, borderRadius: 2, padding: '0 1px' }} title={`Importance: ${(att * 100).toFixed(0)}%`}>
                        {sequence[i]}
                    </span>
                );
            }
        }
        const color = MOTIF_COLORS[entity.type] || '#90caf9';
        result.push(
            <span
                key={idx}
                style={{ background: color, borderRadius: 3, padding: '0 2px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                title={entity.label}
            >
                {sequence.slice(entity.start, entity.end + 1)}
            </span>
        );
        lastIdx = entity.end + 1;
    });
    if (lastIdx < sequence.length) {
        for (let i = lastIdx; i < sequence.length; i++) {
            const att = attention ? attention[i] : 0;
            result.push(
                <span key={`att-${i}`} style={{ background: `rgba(255,0,0,${att})`, borderRadius: 2, padding: '0 1px' }} title={`Importance: ${(att * 100).toFixed(0)}%`}>
                    {sequence[i]}
                </span>
            );
        }
    }
    return result;
};

function downloadFile(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function exportMotifsCSV(entities: NEREntity[]) {
    const csv = 'Start,End,Type,Label\n' +
        entities.map(e => `${e.start},${e.end},${e.type},"${e.label}"`).join('\n');
    downloadFile('motifs.csv', csv, 'text/csv');
}

function exportMotifsJSON(entities: NEREntity[]) {
    downloadFile('motifs.json', JSON.stringify(entities, null, 2), 'application/json');
}

export const NERAnalysis: React.FC<NERAnalysisProps> = ({ sequence }) => {
    const [entities, setEntities] = useState<NEREntity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mock attention: random importance for each base
    const attention = sequence.split('').map(() => Math.random());

    const handleRunNER = async () => {
        setIsLoading(true);
        setError(null);
        setEntities([]);
        try {
            const response = await runNER(sequence);
            if (response.status === 'error') {
                setError(response.error || 'NER failed');
                return;
            }
            setEntities(response.data?.entities || []);
        } catch (err) {
            setError('NER failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Advanced Sequence Analysis (Motif Finder)
            </Typography>
            <Button variant="contained" color="primary" onClick={handleRunNER} disabled={isLoading} sx={{ mb: 2 }}>
                {isLoading ? <CircularProgress size={24} /> : 'Run Advanced Analysis'}
            </Button>
            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
            {entities.length > 0 && (
                <>
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Sequence with Highlighted Motifs & Importance:
                    </Typography>
                    <Box sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 2, wordBreak: 'break-all' }}>
                        {highlightSequence(sequence, entities, attention)}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ width: 80, height: 16, background: 'linear-gradient(90deg, #fff 0%, #f44336 100%)', borderRadius: 2, mr: 1 }} />
                        <Typography variant="caption">Low Importance</Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="caption">High Importance</Typography>
                    </Box>
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        {Object.entries(MOTIF_COLORS).map(([type, color]) => (
                            <Chip
                                key={type}
                                label={MOTIF_LABELS[type] || type}
                                sx={{ bgcolor: color, color: '#fff', fontWeight: 600 }}
                            />
                        ))}
                    </Stack>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Start</TableCell>
                                    <TableCell>End</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Label</TableCell>
                                    <TableCell>Confidence</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {entities.map((entity, idx) => {
                                    const confidence = (0.7 + Math.random() * 0.3).toFixed(2);
                                    return (
                                        <TableRow key={idx}>
                                            <TableCell>{entity.start}</TableCell>
                                            <TableCell>{entity.end}</TableCell>
                                            <TableCell>{MOTIF_LABELS[entity.type] || entity.type}</TableCell>
                                            <TableCell>{entity.label}</TableCell>
                                            <TableCell>
                                                <Tooltip title="Model confidence (mock)">
                                                    <span>{confidence}</span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Tooltip title="Export motifs as CSV">
                            <span>
                                <Button variant="outlined" color="primary" onClick={() => exportMotifsCSV(entities)}>
                                    Export CSV
                                </Button>
                            </span>
                        </Tooltip>
                        <Tooltip title="Export motifs as JSON">
                            <span>
                                <Button variant="outlined" color="primary" onClick={() => exportMotifsJSON(entities)}>
                                    Export JSON
                                </Button>
                            </span>
                        </Tooltip>
                    </Stack>
                </>
            )}
        </Paper>
    );
}; 