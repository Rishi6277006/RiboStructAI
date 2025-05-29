import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import { Box, Paper, Typography, Stack, Chip, Button, Tooltip, Tabs, Tab, TextField, InputAdornment } from '@mui/material';
import { RNASequenceAnalysis, BindingSite } from '../types';
import { Fornac } from 'fornac';

interface RNAStructureVisualizationProps {
    analysis: RNASequenceAnalysis;
    bindingSites?: BindingSite[];
}

const BINDING_SITE_COLORS: Record<string, string> = {
    'Poly-G': '#388e3c',
    'Poly-C': '#0288d1',
    'Poly-A': '#fbc02d',
    'Poly-U': '#d32f2f',
};

const BINDING_SITE_LABELS: Record<string, string> = {
    'Poly-G': 'Poly-G (GGG)',
    'Poly-C': 'Poly-C (CCC)',
    'Poly-A': 'Poly-A (AAA)',
    'Poly-U': 'Poly-U (UUU)',
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

function exportStructureCSV(analysis: RNASequenceAnalysis) {
    const { sequence, structure, mfe } = analysis.sequence;
    const csv = `Sequence,Structure,MFE\n"${sequence}","${structure}",${mfe}\n`;
    downloadFile('structure.csv', csv, 'text/csv');
}

function exportStructureJSON(analysis: RNASequenceAnalysis) {
    downloadFile('structure.json', JSON.stringify(analysis.sequence, null, 2), 'application/json');
}

function exportPlot(format: 'png' | 'svg', plotRef: React.RefObject<HTMLDivElement | null>) {
    if (!plotRef.current) return;
    Plotly.downloadImage(plotRef.current as any, {
        format,
        filename: `structure-plot`,
        width: 900,
        height: 600,
    });
}

export const RNAStructureVisualization: React.FC<RNAStructureVisualizationProps> = ({
    analysis,
    bindingSites = [],
}) => {
    const plotRef = useRef<HTMLDivElement>(null);
    const fornacRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [fornacInstance, setFornacInstance] = useState<Fornac | null>(null);
    const [pdbId, setPdbId] = useState('');
    const [pdbError, setPdbError] = useState('');
    const [loadingPdb, setLoadingPdb] = useState(false);
    const [designerLength, setDesignerLength] = useState(50);
    const [designerNumSamples, setDesignerNumSamples] = useState(5);
    const [designerLoading, setDesignerLoading] = useState(false);
    const [designerSequences, setDesignerSequences] = useState<string[]>([]);
    const [designerError, setDesignerError] = useState('');

    useEffect(() => {
        if (!analysis.sequence || !fornacRef.current) return;

        // Initialize Fornac
        const fornac = new Fornac(fornacRef.current, {
            width: '100%',
            height: '100%',
            allowPanningAndZooming: true,
            showControls: true,
            showLegend: true,
            showSequence: true,
            showStructure: true,
            showNucleotides: true,
            showBasePairs: true,
            showMotifs: true,
            showBindingSites: true,
        });

        // Add the RNA structure
        const { sequence, structure } = analysis.sequence;
        
        // Type guard to ensure structure is defined
        if (!structure) {
            console.warn('No structure available for visualization');
            return;
        }

        const getBindingSiteColor = (label: string | undefined): string => {
            if (!label) return '#1976d2';
            return BINDING_SITE_COLORS[label] || '#1976d2';
        };

        const getBindingSiteLabel = (label: string | undefined): string => {
            if (!label) return 'Unknown';
            return BINDING_SITE_LABELS[label] || label;
        };

        fornac.addRNA(sequence, structure, {
            name: 'RNA Structure',
            colorScheme: 'sequence',
            highlightRegions: bindingSites.map(site => {
                const label = site.label || 'Unknown';
                return {
                    start: site.start - 1,
                    end: site.end - 1,
                    color: getBindingSiteColor(label),
                    label: getBindingSiteLabel(label)
                };
            })
        });

        setFornacInstance(fornac);

        return () => {
            fornac.destroy();
        };
    }, [analysis, bindingSites]);

    useEffect(() => {
        if (!plotRef.current || !analysis.visualization || activeTab !== 0) return;

        const layout: Partial<Plotly.Layout> = {
            title: { text: 'RNA Secondary Structure' },
            showlegend: false,
            hovermode: 'closest',
            margin: { b: 20, l: 5, r: 5, t: 40 },
            xaxis: { showgrid: false, zeroline: false, showticklabels: false },
            yaxis: { showgrid: false, zeroline: false, showticklabels: false },
        };

        // Highlight nodes in binding site region by type
        const nodeTrace = analysis.visualization.data[1];
        const nodeColors = nodeTrace.x.map((_: any, idx: number) => {
            // Find the first binding site this node is in
            const site = bindingSites.find(site => idx + 1 >= site.start && idx + 1 <= site.end);
            if (site && site.label && BINDING_SITE_COLORS[site.label]) {
                return BINDING_SITE_COLORS[site.label];
            }
            return '#1976d2'; // Default color
        });
        const nodeTexts = (nodeTrace.text || nodeTrace.x.map(() => ''))
            .map((txt: string, idx: number) => {
                const site = bindingSites.find(site => idx + 1 >= site.start && idx + 1 <= site.end);
                if (site && site.label) {
                    return `${txt} (${site.label})`;
                }
                return txt;
            });

        const updatedNodeTrace = {
            ...nodeTrace,
            type: 'scatter' as const,
            mode: 'text+markers' as 'text+markers',
            hoverinfo: 'text' as 'text',
            marker: {
                ...nodeTrace.marker,
                color: nodeColors,
            },
            text: nodeTexts,
        };

        // Keep edge trace as is
        const edgeTrace = {
            ...analysis.visualization.data[0],
            type: 'scatter' as const,
            mode: 'lines' as 'lines',
            hoverinfo: 'none' as 'none',
        };

        Plotly.newPlot(plotRef.current, [edgeTrace, updatedNodeTrace], layout);
    }, [analysis, bindingSites, activeTab]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // Handle PDB file upload
    const handlePdbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            console.log('Uploading file:', e.target.files[0]);
            setPdbError('');
        }
    };

    // Handle PDB ID fetch
    const handleFetchPdb = async () => {
        if (!pdbId) return;
        setLoadingPdb(true);
        setPdbError('');
        try {
            // Fetch from backend proxy instead of RCSB directly
            const res = await fetch(`/api/fetch-pdb?pdb_id=${pdbId.toUpperCase()}`);
            if (!res.ok) throw new Error('Not found');
            const pdbText = await res.text();
            // Use a File object for NGL compatibility
        } catch {
            setPdbError('Failed to fetch PDB from RCSB.');
        } finally {
            setLoadingPdb(false);
        }
    };

    const handleGenerateRNA = async () => {
        setDesignerLoading(true);
        setDesignerError('');
        setDesignerSequences([]);
        try {
            const res = await fetch('/api/generate-rna', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ num_samples: designerNumSamples, length: designerLength })
            });
            if (!res.ok) throw new Error('Failed to generate RNA');
            const data = await res.json();
            setDesignerSequences(data.sequences || []);
        } catch (err: any) {
            setDesignerError('Error generating RNA sequences.');
        } finally {
            setDesignerLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Structure Visualization
            </Typography>
            
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Secondary Structure" />
                <Tab label="Interactive View" />
                <Tab label="RNA Designer" />
            </Tabs>

            {activeTab === 0 && (
                <Box className="tab-panel-fade" role="tabpanel" aria-labelledby="tab-secondary-structure" sx={{ width: '100%', height: '500px' }} ref={plotRef} />
            )}

            {activeTab === 1 && (
                <Box className="tab-panel-fade" role="tabpanel" aria-labelledby="tab-interactive-view" sx={{ width: '100%', height: '500px', border: '1px solid #ccc' }}>
                    <div ref={fornacRef} style={{ width: '100%', height: '100%' }} />
                </Box>
            )}

            {activeTab === 2 && (
                <Box className="tab-panel-fade" role="tabpanel" aria-labelledby="tab-rna-designer" sx={{ width: '100%', maxWidth: 700, mx: 'auto', mb: 2 }}>
                    <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', zIndex: 3, position: 'relative' }}>
                        <TextField
                            label="Sequence Length"
                            type="number"
                            size="small"
                            value={designerLength}
                            onChange={e => setDesignerLength(Number(e.target.value))}
                            sx={{ minWidth: 120 }}
                        />
                        <TextField
                            label="Number of Samples"
                            type="number"
                            size="small"
                            value={designerNumSamples}
                            onChange={e => setDesignerNumSamples(Number(e.target.value))}
                            sx={{ minWidth: 120 }}
                        />
                        <Button onClick={handleGenerateRNA} disabled={designerLoading} variant="contained" size="small">
                            {designerLoading ? 'Generating...' : 'Generate RNA'}
                        </Button>
                        {designerError && <Typography color="error">{designerError}</Typography>}
                    </Paper>
                    <Box sx={{ width: '100%', minHeight: 200, border: '1px solid #ccc', background: '#fafafa', p: 2 }}>
                        {designerSequences.length > 0 ? (
                            <>
                                <Typography variant="subtitle1">Generated Sequences:</Typography>
                                <ol>
                                    {designerSequences.map((seq, idx) => (
                                        <li key={idx} style={{ fontFamily: 'monospace', fontSize: 16 }}>{seq}</li>
                                    ))}
                                </ol>
                            </>
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                Enter parameters and click "Generate RNA" to create new sequences.
                            </Typography>
                        )}
                    </Box>
                </Box>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 2 }}>
                {Object.entries(BINDING_SITE_COLORS).map(([type, color]) => (
                    <Chip
                        key={type}
                        label={BINDING_SITE_LABELS[type] || type}
                        sx={{ bgcolor: color, color: '#fff', fontWeight: 600 }}
                    />
                ))}
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Tooltip title="Export structure as CSV">
                    <span>
                        <Button variant="outlined" color="primary" onClick={() => exportStructureCSV(analysis)}>
                            Export CSV
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title="Export structure as JSON">
                    <span>
                        <Button variant="outlined" color="primary" onClick={() => exportStructureJSON(analysis)}>
                            Export JSON
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title="Download plot as PNG">
                    <span>
                        <Button variant="outlined" color="secondary" onClick={() => exportPlot('png', plotRef)}>
                            Download PNG
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title="Download plot as SVG">
                    <span>
                        <Button variant="outlined" color="secondary" onClick={() => exportPlot('svg', plotRef)}>
                            Download SVG
                        </Button>
                    </span>
                </Tooltip>
            </Stack>

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Predicted Structure:
            </Typography>
            <Typography
                component="pre"
                sx={{
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                }}
            >
                {analysis.predictedStructure}
            </Typography>
        </Paper>
    );
};

// Helper function to convert dot-bracket notation to PDB format
function convertToPDB(sequence: string, structure: string): string {
    let pdb = '';
    let atomCount = 1;
    let residueCount = 1;

    // Create backbone atoms
    for (let i = 0; i < sequence.length; i++) {
        const base = sequence[i];
        const x = Math.cos(i * 2 * Math.PI / sequence.length) * 10;
        const y = Math.sin(i * 2 * Math.PI / sequence.length) * 10;
        const z = 0;

        // Add P atom
        pdb += `ATOM  ${atomCount.toString().padStart(5)}  P   ${base} A${residueCount.toString().padStart(4)}    ${x.toFixed(3)} ${y.toFixed(3)} ${z.toFixed(3)}  1.00  0.00\n`;
        atomCount++;

        // Add O5' atom
        pdb += `ATOM  ${atomCount.toString().padStart(5)}  O5' ${base} A${residueCount.toString().padStart(4)}    ${(x + 1).toFixed(3)} ${y.toFixed(3)} ${z.toFixed(3)}  1.00  0.00\n`;
        atomCount++;

        // Add C5' atom
        pdb += `ATOM  ${atomCount.toString().padStart(5)}  C5' ${base} A${residueCount.toString().padStart(4)}    ${(x + 2).toFixed(3)} ${y.toFixed(3)} ${z.toFixed(3)}  1.00  0.00\n`;
        atomCount++;

        // Add base atoms
        const baseX = x + 3;
        const baseY = y;
        const baseZ = z;
        pdb += `ATOM  ${atomCount.toString().padStart(5)}  N1  ${base} A${residueCount.toString().padStart(4)}    ${baseX.toFixed(3)} ${baseY.toFixed(3)} ${baseZ.toFixed(3)}  1.00  0.00\n`;
        atomCount++;

        residueCount++;
    }

    // Add CONECT records for base pairs
    for (let i = 0; i < structure.length; i++) {
        if (structure[i] === '(') {
            const j = structure.indexOf(')', i);
            if (j !== -1) {
                const atom1 = (i * 4 + 1).toString().padStart(5);
                const atom2 = (j * 4 + 1).toString().padStart(5);
                pdb += `CONECT ${atom1} ${atom2}\n`;
            }
        }
    }

    pdb += 'END\n';
    return pdb;
} 