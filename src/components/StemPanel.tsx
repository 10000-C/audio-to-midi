import type { StemState } from '../types';
import StemCard from './StemCard';

interface Props {
  stems: StemState[];
  step: string;
  onTranscribe: (index: number) => void;
  onTranscribeAll: () => void;
  onDownloadMidi: (stem: StemState) => void;
  onDownloadAudio: (stem: StemState) => void;
}

export default function StemPanel({
  stems,
  step,
  onTranscribe,
  onTranscribeAll,
  onDownloadMidi,
  onDownloadAudio,
}: Props) {
  if (!['separated', 'transcribing', 'complete'].includes(step)) return null;

  const transcribing = step === 'transcribing';
  const canTranscribeAll = stems.some((s) => s.status === 'separated');

  return (
    <div className="stem-panel">
      <div className="stem-panel-header">
        <h2>🎵 分轨列表</h2>
        {canTranscribeAll && (
          <button
            className="btn btn-primary"
            onClick={onTranscribeAll}
            disabled={transcribing}
          >
            {transcribing ? '⏳ 批量转录中...' : '🎶 全部转录'}
          </button>
        )}
      </div>

      <div className="stem-grid">
        {stems.map((stem, i) => (
          <StemCard
            key={stem.key}
            stem={stem}
            index={i}
            onTranscribe={onTranscribe}
            onDownloadMidi={onDownloadMidi}
            onDownloadAudio={onDownloadAudio}
            transcribing={transcribing}
          />
        ))}
      </div>
    </div>
  );
}
