import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, MenuItem, Select, FormControl, InputLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Tooltip, Stack } from '@mui/material';
import { predictBindingSites } from '../services/api';
import { SmallMolecule, BindingSite } from '../types';

const DUMMY_MOLECULES: SmallMolecule[] = [
    { name: 'LigandX', smiles: 'CCO' },
    { name: 'LigandY', smiles: 'CCN' },
    { name: 'LigandZ', smiles: 'CCC' },
];

interface BindingSitePredictionProps {
    sequence: string;
    bindingSites: BindingSite[];
    onBindingSites: (sites: BindingSite[]) => void;
}

function downloadFile(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function exportBindingSitesCSV(bindingSites: BindingSite[]) {
    const csv = 'Start,End,Confidence,Molecule,Label\n' +
        bindingSites.map(site => `${site.start},${site.end},${site.confidence},${site.molecule?.name || ''},"${site.label || ''}"`).join('\n');
    downloadFile('binding_sites.csv', csv, 'text/csv');
}

function exportBindingSitesJSON(bindingSites: BindingSite[]) {
    downloadFile('binding_sites.json', JSON.stringify(bindingSites, null, 2), 'application/json');
}

export const BindingSitePrediction: React.FC<BindingSitePredictionProps> = ({ sequence, bindingSites, onBindingSites }) => {
    const [selectedMolecule, setSelectedMolecule] = useState<SmallMolecule>(DUMMY_MOLECULES[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePredict = async () => {
        setIsLoading(true);
        setError(null);
        onBindingSites([]);
        try {
            const response = await predictBindingSites(sequence, selectedMolecule);
            if (response.status === 'error') {
                setError(response.error || 'Prediction failed');
                return;
            }
            onBindingSites(response.data?.bindingSites || []);
        } catch (err) {
            setError('Prediction failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Predict Binding Sites
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel id="molecule-label">Molecule</InputLabel>
                    <Select
                        labelId="molecule-label"
                        value={selectedMolecule.name}
                        label="Molecule"
                        onChange={e => {
                            const mol = DUMMY_MOLECULES.find(m => m.name === e.target.value);
                            if (mol) setSelectedMolecule(mol);
                        }}
                    >
                        {DUMMY_MOLECULES.map(mol => (
                            <MenuItem key={mol.name} value={mol.name}>{mol.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" color="secondary" onClick={handlePredict} disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : 'Predict Binding Sites'}
                </Button>
            </Box>
            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
            {bindingSites.length > 0 && (
                <>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Start</TableCell>
                                    <TableCell>End</TableCell>
                                    <TableCell>Label</TableCell>
                                    <TableCell>Molecule</TableCell>
                                    <TableCell>Confidence</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bindingSites.map((site, idx) => {
                                    const confidence = (0.7 + Math.random() * 0.3).toFixed(2);
                                    return (
                                        <TableRow key={idx}>
                                            <TableCell>{site.start}</TableCell>
                                            <TableCell>{site.end}</TableCell>
                                            <TableCell>{site.label}</TableCell>
                                            <TableCell>{site.molecule?.name || ''}</TableCell>
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
                        <Tooltip title="Export binding sites as CSV">
                            <span>
                                <Button variant="outlined" color="primary" onClick={() => exportBindingSitesCSV(bindingSites)}>
                                    Export CSV
                                </Button>
                            </span>
                        </Tooltip>
                        <Tooltip title="Export binding sites as JSON">
                            <span>
                                <Button variant="outlined" color="primary" onClick={() => exportBindingSitesJSON(bindingSites)}>
                                    Export JSON
                                </Button>
                            </span>
                        </Tooltip>
                    </Stack>
                </>
            )}
            {!isLoading && bindingSites.length === 0 && (
                <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                    No binding sites found for this sequence.
                </Typography>
            )}
        </Paper>
    );
}; 