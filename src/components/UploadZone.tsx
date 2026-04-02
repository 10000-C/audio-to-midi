import { useCallback, useRef, useState } from 'react';
import type { StepStatus } from '../types';

interface Props {
  step: StepStatus;
  onUpload: (file: File) => void;
}

export default function UploadZone({ step, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const disabled = step !== 'idle';

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (files && files[0]) {
        const f = files[0];
        if (f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|flac|m4a|ogg|wma|aac)$/i)) {
          onUpload(f);
        } else {
          alert('请上传音频文件（MP3, WAV, FLAC, M4A, OGG）');
        }
      }
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setDragging(true);
    },
    [disabled]
  );

  const onDragLeave = () => setDragging(false);

  const onClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const statusLabel: Record<string, string> = {
    idle: '拖拽音频文件到此处，或点击选择',
    uploading: '⏳ 正在上传...',
    ready: '✅ 上传完成，可以开始分离',
    separating: '🎛️ 音轨分离中...',
    separated: '✅ 分离完成，可以转录',
    transcribing: '🎵 转录中...',
    complete: '✅ 全部完成！',
  };

  return (
    <div className="upload-zone-wrapper">
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.flac,.m4a,.ogg,.wma,.aac"
        className="upload-input"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />
      <div
        className={`upload-zone ${dragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={onClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {step === 'uploading' ? (
          <div className="spinner" />
        ) : (
          <div className="upload-icon">📂</div>
        )}
        <p className="upload-text">{statusLabel[step]}</p>
        {!disabled && (
          <p className="upload-hint">支持 MP3 / WAV / FLAC / M4A / OGG</p>
        )}
      </div>
    </div>
  );
}
