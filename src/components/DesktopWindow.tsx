import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, X, RotateCcw } from 'lucide-react';
import { WindowInstance } from '../types/window';

interface DesktopWindowProps {
  window: WindowInstance;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onToggleMaximize: (id: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
}

export const DesktopWindow: React.FC<DesktopWindowProps> = ({
  window,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onUpdatePosition,
  children,
}) => {
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Handle Dragging
  const handlePointerDownHeader = (e: React.PointerEvent) => {
    // Only drag with left click and not on control buttons
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    if (window.isMaximized) return;

    onFocus(window.id);
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: window.x,
      winY: window.y,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveHeader = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;

    const newX = Math.max(10, Math.min(document.documentElement.clientWidth - 150, dragStartRef.current.winX + deltaX));
    const newY = Math.max(10, Math.min(document.documentElement.clientHeight - 80, dragStartRef.current.winY + deltaY));

    onUpdatePosition(window.id, newX, newY);
  };

  const handlePointerUpHeader = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  if (window.isMinimized) return null;

  const style: React.CSSProperties = window.isMaximized
    ? {
        position: 'fixed',
        top: '12px',
        left: '12px',
        right: '12px',
        bottom: '48px',
        width: 'auto',
        height: 'auto',
        zIndex: window.zIndex,
      }
    : {
        position: 'fixed',
        left: `${window.x}px`,
        top: `${window.y}px`,
        width: `${window.width}px`,
        height: `${window.height}px`,
        maxWidth: '96vw',
        maxHeight: '90vh',
        zIndex: window.zIndex,
      };

  return (
    <div
      ref={windowRef}
      style={style}
      onPointerDown={() => onFocus(window.id)}
      className="bg-white rounded-xs border-2 border-[#008b8b] shadow-2xl flex flex-col overflow-hidden select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Window Header */}
      <div
        onPointerDown={handlePointerDownHeader}
        onPointerMove={handlePointerMoveHeader}
        onPointerUp={handlePointerUpHeader}
        onDoubleClick={() => onToggleMaximize(window.id)}
        className="flex items-center justify-between px-3 py-1.5 bg-white border-b-2 border-[#008b8b] cursor-move select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-[#008b8b] shrink-0" />
          <span className="font-bold text-xs sm:text-sm text-[#008b8b] tracking-tight truncate">
            {window.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-700 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize(window.id);
            }}
            className="p-1 hover:bg-slate-100 rounded text-slate-700"
            title="최소화"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMaximize(window.id);
            }}
            className="p-1 hover:bg-slate-100 rounded text-slate-700"
            title={window.isMaximized ? '이전 크기로 복원' : '최대화'}
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose(window.id);
            }}
            className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-slate-700"
            title="닫기"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
};
