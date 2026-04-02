import type { Prediction } from './types';

const BASE = '/api';

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Upload audio to Replicate (returns { uri: string })
export async function uploadAudio(file: File): Promise<{ uri: string }> {
  // Convert to ArrayBuffer and send as raw binary
  const buffer = await file.arrayBuffer();
  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: buffer,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Upload failed: ${res.status}`);
  }
  return res.json();
}

// Create prediction
export async function createPrediction(
  model: 'demucs' | 'basic-pitch',
  input: Record<string, unknown>
): Promise<Prediction> {
  return post<Prediction>('/predict', { action: 'create', model, input });
}

// Poll prediction
export async function pollPrediction(predictionId: string): Promise<Prediction> {
  return post<Prediction>('/predict', { action: 'poll', predictionId });
}

// Poll until terminal status (with timeout)
export async function pollUntilDone(
  predictionId: string,
  onProgress?: (status: string) => void,
  timeoutMs = 300_000, // 5 minutes max
  intervalMs = 3000
): Promise<Prediction> {
  const start = Date.now();

  while (true) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('Prediction timed out');
    }

    const prediction = await pollPrediction(predictionId);
    onProgress?.(prediction.status);

    if (prediction.status === 'succeeded') return prediction;
    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      throw new Error(prediction.error || `Prediction ${prediction.status}`);
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

// Get download URL for MIDI (proxied)
export function getDownloadUrl(fileUrl: string, filename: string): string {
  return `${BASE}/download?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(filename)}`;
}

// Get download URL for audio stem (proxied)
export function getStemDownloadUrl(fileUrl: string, stemName: string): string {
  return `${BASE}/download?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(stemName + '.mp3')}`;
}
