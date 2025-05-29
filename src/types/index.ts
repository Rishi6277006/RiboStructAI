export interface RNASequence {
    sequence: string;
    structure?: string;
    mfe?: number;
}

export interface SmallMolecule {
    smiles: string;
    name?: string;
    properties?: {
        molecularWeight: number;
        numAtoms: number;
        numBonds: number;
        numRotatableBonds: number;
        numHDonors: number;
        numHAcceptors: number;
        logP: number;
    };
}

export interface BindingSite {
    start: number;
    end: number;
    confidence: number;
    molecule?: SmallMolecule;
    label: string;
}

export interface RNASequenceAnalysis {
    sequence: RNASequence;
    predictedStructure: string;
    bindingSites: BindingSite[];
    visualization?: {
        data: Array<{
            x: number[];
            y: number[];
            type: string;
            mode?: string;
            text?: string[];
            hoverinfo?: string;
            line?: { width: number; color: string };
            marker?: {
                showscale: boolean;
                colorscale: string;
                size: number;
            };
        }>;
    };
}

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    error?: string;
}

export interface NEREntity {
    start: number;
    end: number;
    type: string;
    label: string;
}

export interface NERResponse {
    entities: NEREntity[];
} 