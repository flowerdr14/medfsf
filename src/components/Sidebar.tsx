import React from 'react';
import {
  Users,
  Mail,
  Paperclip,
  Send,
  Megaphone,
  Vote,
  Settings,
  LogOut,
  MessageCircle,
} from 'lucide-react';
import { TeacherUser } from '../types/messenger';

export type NavTab =
  | 'org'
  | 'received-notes'
  | 'received-files'
  | 'sent-notes'
  | 'sent-files'
  | 'chat'
  | 'notices'
  | 'polls';

interface SidebarProps {
  currentUser: TeacherUser;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  unreadNotesCount: number;
  unreadChatsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  onLogout,
  unreadNotesCount,
  unreadChatsCount,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'org',
      label: '조직도',
      icon: <Users className="w-6 h-6 stroke-[1.8]" />,
    },
    {
      id: 'received-notes',
      label: '받은 쪽지',
      icon: <Mail className="w-6 h-6 stroke-[1.8]" />,
      badge: unreadNotesCount,
    },
    {
      id: 'received-files',
      label: '받은 파일',
      icon: <Paperclip className="w-6 h-6 stroke-[1.8]" />,
    },
    {
      id: 'sent-notes',
      label: '보낸 쪽지',
      icon: <Send className="w-6 h-6 stroke-[1.8]" />,
    },
    {
      id: 'sent-files',
      label: '보낸 파일',
      icon: <Paperclip className="w-6 h-6 stroke-[1.8]" />,
    },
    {
      id: 'chat',
      label: '실시간 대화',
      icon: <MessageCircle className="w-6 h-6 stroke-[1.8]" />,
      badge: unreadChatsCount,
    },
    {
      id: 'notices',
      label: '공지',
      icon: <Megaphone className="w-6 h-6 stroke-[1.8]" />,
    },
    {
      id: 'polls',
      label: '투표',
      icon: <Vote className="w-6 h-6 stroke-[1.8]" />,
    },
  ];

  return (
    <div className="w-[72px] sm:w-[80px] shrink-0 bg-[#008b8b] text-white flex flex-col justify-between py-3 select-none border-r border-[#007373] shadow-xs">
      {/* Navigation Buttons list */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center w-[60px] sm:w-[68px] py-2 rounded-md transition-all group ${
                isActive
                  ? 'bg-teal-700/80 text-white font-bold shadow-inner'
                  : 'text-teal-100 hover:bg-teal-800/40 hover:text-white'
              }`}
              title={item.label}
            >
              <div className="relative">
                {item.icon}
                {!!item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center border border-white shadow-xs animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] mt-1 tracking-tight text-center leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom utility icons: Settings & Logout/Switch */}
      <div className="flex flex-col items-center gap-2 pt-3 border-t border-teal-600/40 w-full">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center w-[60px] sm:w-[68px] py-1.5 rounded-md text-teal-100 hover:bg-teal-800/40 hover:text-white transition-colors"
          title="알림 및 환경 설정"
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] sm:text-[11px] mt-1">설정</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="flex flex-col items-center justify-center w-[60px] sm:w-[68px] py-1.5 rounded-md text-teal-100 hover:bg-teal-800/40 hover:text-white transition-colors"
          title="교사 전환 / 로그인"
        >
          <LogOut className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] sm:text-[11px] mt-1">교사전환</span>
        </button>
      </div>
    </div>
  );
};
