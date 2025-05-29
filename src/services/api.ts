import axios from 'axios';
import { RNASequenceAnalysis, SmallMolecule, ApiResponse, NERResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const analyzeRNASequence = async (sequence: string): Promise<ApiResponse<RNASequenceAnalysis>> => {
    try {
        const response = await api.post<ApiResponse<RNASequenceAnalysis>>('/api/analyze', { sequence });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return {
                status: 'error',
                error: error.response.data.error || 'An error occurred',
            };
        }
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'An error occurred',
        };
    }
};

export const predictBindingSites = async (
    sequence: string,
    molecule?: SmallMolecule
): Promise<ApiResponse<RNASequenceAnalysis>> => {
    try {
        const response = await api.post<ApiResponse<RNASequenceAnalysis>>('/api/predict-binding', {
            sequence,
            molecule,
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return {
                status: 'error',
                error: error.response.data.error || 'An error occurred',
            };
        }
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'An error occurred',
        };
    }
};

export const validateSequence = (sequence: string): boolean => {
    const validNucleotides = /^[ACGU]+$/;
    return validNucleotides.test(sequence.toUpperCase());
};

export const runNER = async (sequence: string): Promise<ApiResponse<NERResponse>> => {
    try {
        const response = await api.post<ApiResponse<NERResponse>>('/api/ner', { sequence });
        return response.data;
    } catch (error) {
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'An error occurred',
        };
    }
}; 