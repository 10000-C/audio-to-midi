import type { StemState } from '../types';

interface Props {
  stem: StemState;
  index: number;
  onTranscribe: (index: number) => void;
  onDownloadMidi: (stem: StemState) => void;
  onDownloadAudio: (stem: StemState) => void;
  transcribing: boolean;
}

export default function StemCard({
  stem,
  index,
  onTranscribe,
  onDownloadMidi,
  onDownloadAudio,
  transcribing,
}: Props) {
  const isLoading = stem.status === 'transcribing' || stem.status === 'separated';
  const isDone = stem.status === 'done';
  const isError = stem.status === 'error';
  const showTranscribe = ['separated', 'error'].includes(stem.status);

  const statusBadge: Record<string, { label: string; cls: string }> = {
    idle: { label: '等待分离', cls: 'badge-idle' },
    separated: { label: '已分离', cls: 'badge-ready' },
    transcribing: { label: '转录中...', cls: 'badge-loading' },
    done: { label: '已完成', cls: 'badge-done' },
    error: { label: '失败', cls: 'badge-error' },
  };

  const badge = statusBadge[stem.status] || statusBadge.idle;

  return (
    <div className={`stem-card ${stem.status}`}>
      <div className="stem-header">
        <span className="stem-icon">{stem.icon}</span>
        <span className="stem-label">{stem.label}</span>
        <span className={`stem-badge ${badge.cls}`}>{badge.label}</span>
      </div>

      {/* Audio preview */}
      {stem.audioUrl && (
        <audio controls className="stem-audio" preload="metadata">
          <source src={stem.audioUrl} type="audio/mpeg" />
        </audio>
      )}

      {/* Error message */}
      {isError && stem.error && (
        <p className="stem-error">⚠️ {stem.error}</p>
      )}

      {/* Actions */}
      <div className="stem-actions">
        {stem.audioUrl && (
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => onDownloadAudio(stem)}
            title="下载分离音频"
          >
            🎧 音频
          </button>
        )}

        {showTranscribe && (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => onTranscribe(index)}
            disabled={transcribing}
          >
            🎵 转录
          </button>
        )}

        {isLoading && <div className="spinner-sm" />}

        {isDone && stem.midiUrl && stem.midiFilename && (
          <button
            className="btn btn-sm btn-success"
            onClick={() => onDownloadMidi(stem)}
          >
            📥 MIDI
          </button>
        )}
      </div>
    </div>
  );
}
