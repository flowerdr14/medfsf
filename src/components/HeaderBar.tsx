import React from 'react';
import { Minus, Square, X, School } from 'lucide-react';

interface HeaderBarProps {
  title?: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isMaximized?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title = '경원남도 메신저',
  onMinimize,
  onMaximize,
  onClose,
  isMaximized = false,
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b-2 border-[#008b8b] select-none text-slate-800">
      {/* Logo & App Title */}
      <div className="flex items-center gap-2">
        {/* Custom School Messenger Logo SVG matching the screenshot */}
        <div className="flex items-center justify-center w-7 h-7">
          <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
            {/* Orange round head/sun */}
            <circle cx="20" cy="11" r="5" fill="#f97316" />
            {/* Left curved wing (blue) */}
            <path
              d="M8 28C8 22 13 18 20 22C16 26 12 28 8 28Z"
              fill="#0284c7"
            />
            {/* Right curved wing (teal) */}
            <path
              d="M32 28C32 22 27 18 20 22C24 26 28 28 32 28Z"
              fill="#0d9488"
            />
            {/* Bottom book / base (dark navy) */}
            <path
              d="M10 28C14 27 18 26 20 27C22 26 26 27 30 28L28 32C24 30.5 22 30.5 20 31.5C18 30.5 16 30.5 12 32L10 28Z"
              fill="#1e3a8a"
            />
          </svg>
        </div>
        <span className="font-bold text-base tracking-tight text-slate-800 flex items-center gap-1.5">
          {title}
        </span>
      </div>

      {/* Window Controls: - □ X */}
      <div className="flex items-center gap-2 text-slate-700">
        <button
          type="button"
          onClick={onMinimize}
          className="p-1 hover:bg-slate-100 rounded text-slate-700 transition-colors"
          title="최소화"
          aria-label="최소화"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onMaximize}
          className="p-1 hover:bg-slate-100 rounded text-slate-700 transition-colors"
          title={isMaximized ? "이전 크기로 복원" : "최대화"}
          aria-label="최대화"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-slate-700 transition-colors"
          title="닫기"
          aria-label="닫기"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
