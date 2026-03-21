import axios from 'axios';
import type { AnalysisResponse, UploadResponse } from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 120_000, // 2 min — GPT-4o can take time
});

export async function uploadResume(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<UploadResponse>('/upload-resume', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function analyzeResume(
  sessionId: string,
  jobDescription: string
): Promise<AnalysisResponse> {
  const { data } = await api.post<AnalysisResponse>('/analyze', {
    session_id: sessionId,
    job_description: jobDescription,
  });
  return data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await api.delete(`/session/${sessionId}`);
}

export default api;
