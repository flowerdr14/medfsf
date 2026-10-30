import React from 'react';
import { WindowInstance } from '../types/window';
import {
  Mail,
  Send,
  Paperclip,
  MessageCircle,
  Megaphone,
  Vote,
  Settings,
  User,
  LogIn,
  Eye,
} from 'lucide-react';
import { TeacherUser } from '../types/messenger';

interface TaskbarProps {
  windows: WindowInstance[];
  activeWindowId: string | null;
  onWindowClick: (id: string) => void;
  currentUser: TeacherUser;
  onOpenMessengerMain?: () => void;
  isMainMinimized?: boolean;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  onWindowClick,
  currentUser,
  onOpenMessengerMain,
  isMainMinimized,
}) => {
  const getWindowIcon = (type: WindowInstance['type']) => {
    switch (type) {
      case 'note-compose':
        return <Send className="w-3.5 h-3.5 text-teal-400" />;
      case 'note-view':
        return <Mail className="w-3.5 h-3.5 text-blue-400" />;
      case 'notes-list-received':
        return <Mail className="w-3.5 h-3.5 text-teal-400" />;
      case 'notes-list-sent':
        return <Send className="w-3.5 h-3.5 text-cyan-400" />;
      case 'files-list-received':
      case 'files-list-sent':
        return <Paperclip className="w-3.5 h-3.5 text-emerald-400" />;
      case 'chat':
        return <MessageCircle className="w-3.5 h-3.5 text-amber-400" />;
      case 'notices':
        return <Megaphone className="w-3.5 h-3.5 text-red-400" />;
      case 'polls':
        return <Vote className="w-3.5 h-3.5 text-purple-400" />;
      case 'profile':
        return <User className="w-3.5 h-3.5 text-teal-400" />;
      case 'settings':
        return <Settings className="w-3.5 h-3.5 text-slate-300" />;
      case 'login':
        return <LogIn className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <Eye className="w-3.5 h-3.5 text-teal-400" />;
    }
  };

  const now = new Date();
  const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-slate-900 border-t border-slate-700 text-white flex items-center justify-between px-3 z-50 select-none shadow-lg">
      {/* Left: Start / Main Messenger button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMessengerMain}
          className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 transition-colors ${
            !isMainMinimized
              ? 'bg-[#008b8b] text-white shadow-xs'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="경원남도 메신저 메인 창 복원/최소화"
        >
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center p-0.5">
            <span className="w-2 h-2 rounded-full bg-[#008b8b]" />
          </div>
          <span className="tracking-tight">경원남도 메신저</span>
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {/* Windows Taskbar Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar max-w-[60vw]">
          {windows.map((win) => {
            const isActive = activeWindowId === win.id && !win.isMinimized;
            return (
              <button
                key={win.id}
                type="button"
                onClick={() => onWindowClick(win.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs max-w-[180px] transition-all truncate ${
                  isActive
                    ? 'bg-slate-700 text-white font-semibold ring-1 ring-[#008b8b] border-b-2 border-[#008b8b]'
                    : win.isMinimized
                    ? 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title={win.title}
              >
                {getWindowIcon(win.type)}
                <span className="truncate">{win.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: User Presence & Time */}
      <div className="flex items-center gap-3 text-xs text-slate-300">
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-medium text-slate-300">
            {currentUser.name} ({currentUser.role.split(' ')[0]})
          </span>
        </div>
        <span className="font-mono text-xs font-semibold text-slate-200">
          {timeString}
        </span>
      </div>
    </div>
  );
};
