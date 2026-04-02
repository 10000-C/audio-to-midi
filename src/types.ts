// ===== Replicate API Types =====

export type PredictionStatus = 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';

export interface Prediction {
  id: string;
  status: PredictionStatus;
  output?: string | Record<string, string>;
  error?: string;
  logs?: string;
  created_at: string;
  completed_at?: string;
}

// ===== Workflow Steps =====

export type WorkflowStep =
  | 'idle'
  | 'uploading'
  | 'ready'
  | 'separating'
  | 'separated'
  | 'transcribing'
  | 'complete';

export type StepStatus = WorkflowStep;

// ===== Stem Definitions =====

export type StemName = 'drums' | 'bass' | 'other' | 'vocals' | 'piano' | 'guitar';

export const STEMS: { key: StemName; label: string; icon?: string }[] = [
  { key: 'drums',  label: '鼓组 Drums',   icon: '🥁' },
  { key: 'bass',   label: '贝斯 Bass',    icon: '🎸' },
  { key: 'other',  label: '其他 Other',   icon: '🎵' },
  { key: 'vocals', label: '人声 Vocals',  icon: '🎤' },
  { key: 'piano',  label: '钢琴 Piano',   icon: '🎹' },
  { key: 'guitar', label: '吉他 Guitar',  icon: '🎶' },
];

// ===== Stem State =====

export type StemStatus = 'idle' | 'separated' | 'transcribing' | 'done' | 'error';

export interface StemState {
  key: StemName;
  label: string;
  icon?: string;
  status: StemStatus;
  audioUrl: string | null;
  midiUrl: string | null;
  midiFilename: string | null;
  error: string | null;
}

// ===== Results (kept for API layer) =====

export interface SeparationResult {
  stems: Record<StemName, string>; // stem name → audio URL
}

export interface TranscriptionResult {
  midiUrl: string;
  stemName: StemName;
}

// ===== App State =====

export interface AppState {
  step: WorkflowStep;
  fileName: string | null;
  audioUri: string | null;
  stems: StemState[];
  logs: string[];
}
