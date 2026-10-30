import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { FileAttachment } from '../types/messenger';

interface MediaViewerModalProps {
  media: FileAttachment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  media,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !media) return null;

  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = media.url;
    a.download = media.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs select-none">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Top bar */}
        <div className="px-4 py-3 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold truncate">{media.name}</span>
            <span className="text-[11px] text-slate-400">({media.size})</span>
          </div>

          <div className="flex items-center gap-3">
            {media.type === 'image' && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.2))}
                  className="p-1 hover:text-white"
                  title="축소"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.2))}
                  className="p-1 hover:text-white"
                  title="확대"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1 hover:text-white"
                  title="회전"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>다운로드</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media content container */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60 min-h-[360px]">
          {media.type === 'image' && (
            <img
              src={media.url}
              alt={media.name}
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
              }}
              className="max-h-[70vh] max-w-full object-contain rounded select-none"
            />
          )}

          {media.type === 'video' && (
            <div className="w-full flex justify-center max-h-[70vh]">
              <video
                src={media.url}
                controls
                autoPlay
                className="max-h-[70vh] w-full max-w-3xl object-contain rounded"
              />
            </div>
          )}

          {media.type === 'file' && (
            <div className="text-center text-white space-y-3">
              <div className="text-sm font-semibold">{media.name}</div>
              <div className="text-xs text-slate-400">문서 파일 형식 ({media.size})</div>
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 bg-[#008b8b] text-white rounded text-xs font-bold"
              >
                파일 다운로드
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
