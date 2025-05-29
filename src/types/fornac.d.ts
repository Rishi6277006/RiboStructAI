declare module 'fornac' {
    export interface FornacOptions {
        width?: string | number;
        height?: string | number;
        allowPanningAndZooming?: boolean;
        showControls?: boolean;
        showLegend?: boolean;
        showSequence?: boolean;
        showStructure?: boolean;
        showNucleotides?: boolean;
        showBasePairs?: boolean;
        showMotifs?: boolean;
        showBindingSites?: boolean;
    }

    export interface HighlightRegion {
        start: number;
        end: number;
        color: string;
        label: string;
    }

    export interface RNAOptions {
        name?: string;
        colorScheme?: string;
        highlightRegions?: HighlightRegion[];
    }

    export class Fornac {
        constructor(container: HTMLElement, options?: FornacOptions);
        addRNA(sequence: string, structure: string, options?: RNAOptions): void;
        destroy(): void;
    }
} 