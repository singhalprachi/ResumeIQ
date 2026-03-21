import { create } from 'zustand';
import type { AnalysisResponse, AppStep } from '@/types';

interface AppState {
  step: AppStep;
  sessionId: string | null;
  filename: string | null;
  jobDescription: string;
  result: AnalysisResponse | null;
  isLoading: boolean;
  error: string | null;

  setStep: (s: AppStep) => void;
  setSession: (id: string, filename: string) => void;
  setJobDescription: (jd: string) => void;
  setResult: (r: AnalysisResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  step: 'upload',
  sessionId: null,
  filename: null,
  jobDescription: '',
  result: null,
  isLoading: false,
  error: null,

  setStep: (step) => set({ step }),
  setSession: (sessionId, filename) => set({ sessionId, filename }),
  setJobDescription: (jobDescription) => set({ jobDescription }),
  setResult: (result) => set({ result, step: 'results' }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      step: 'upload',
      sessionId: null,
      filename: null,
      jobDescription: '',
      result: null,
      isLoading: false,
      error: null,
    }),
}));
