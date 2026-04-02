import type { StemState } from '../types';

interface Props {
  stems: StemState[];
  onDownloadMidi: (stem: StemState) => void;
  onDownloadAudio: (stem: StemState) => void;
}

export default function ResultPanel({ stems, onDownloadMidi, onDownloadAudio }: Props) {
  const doneStems = stems.filter((s) => s.status === 'done');
  if (doneStems.length === 0) return null;

  return (
    <div className="result-panel">
      <h2>📦 转录结果</h2>
      <p className="result-summary">
        共完成 {doneStems.length}/{stems.length} 个音轨的转录
      </p>

      <div className="result-list">
        {doneStems.map((stem) => (
          <div key={stem.key} className="result-item">
            <span className="result-icon">{stem.icon}</span>
            <span className="result-label">{stem.label}</span>
            <div className="result-buttons">
              {stem.audioUrl && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onDownloadAudio(stem)}
                >
                  🎧 音频
                </button>
              )}
              <button
                className="btn btn-sm btn-success"
                onClick={() => onDownloadMidi(stem)}
              >
                📥 {stem.midiFilename || 'MIDI'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="result-note">
        ⚠️ MIDI 文件托管于 Replicate CDN，链接有效期约 1 小时
      </p>
    </div>
  );
}
