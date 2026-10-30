import React, { useState } from 'react';
import { LogIn, Key, UserCheck, Shield, CheckCircle2 } from 'lucide-react';
import { TeacherUser } from '../types/messenger';
import { MASCOT_IMAGE_URL } from '../data/mockData';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUser: TeacherUser;
  allTeachers: TeacherUser[];
  onSelectUser: (user: TeacherUser) => void;
  isPopup?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allTeachers,
  onSelectUser,
  isPopup = true,
}) => {
  if (!isOpen) return null;

  const [inputTeacherId, setInputTeacherId] = useState('');
  const [inputPassword, setInputPassword] = useState('••••••••');

  const handleIdLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTeacherId.trim()) {
      alert('교직원 사번 또는 아이디를 입력해 주세요.');
      return;
    }
    const matched = allTeachers.find(
      (t) =>
        t.id.toLowerCase() === inputTeacherId.toLowerCase() ||
        t.name.toLowerCase() === inputTeacherId.toLowerCase()
    );
    if (matched) {
      onSelectUser(matched);
      if (onClose) onClose();
    } else {
      alert('등록된 교직원 정보를 찾을 수 없습니다. 아래 빠른 교직원 계정 중 하나를 선택해 주세요.');
    }
  };

  const contentBody = (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar h-full bg-white">
      <div className="bg-[#008b8b] text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white p-0.5 flex items-center justify-center overflow-hidden">
            <img
              src={MASCOT_IMAGE_URL}
              alt="Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <div className="font-bold text-xs">경원남도 메신저 로그인</div>
            <div className="text-[10px] text-teal-100">경원초 교직원 통합 포털 인증</div>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
          {/* Quick Teacher Switcher Banner */}
          <div className="bg-teal-50 border border-teal-200 rounded p-3">
            <div className="text-xs font-bold text-[#008b8b] flex items-center gap-1.5 mb-2">
              <UserCheck className="w-4 h-4" />
              <span>빠른 교직원 계정 전환 (실시간 대화 및 읽음 확인 테스트용)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {allTeachers.slice(0, 6).map((t) => {
                const isCurrent = t.id === currentUser.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onSelectUser(t);
                      if (onClose) onClose();
                    }}
                    className={`flex items-center gap-2 p-2 rounded border text-left transition-all ${
                      isCurrent
                        ? 'border-[#008b8b] bg-white ring-2 ring-[#008b8b] font-bold text-slate-900'
                        : 'border-slate-200 bg-white/80 hover:bg-white hover:border-teal-300 text-slate-700'
                    }`}
                  >
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-7 h-7 rounded-full object-cover border shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate flex items-center gap-1">
                        <span>{t.name}</span>
                        {isCurrent && <CheckCircle2 className="w-3 h-3 text-[#008b8b]" />}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{t.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Traditional Form Login */}
          <form onSubmit={handleIdLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                교원 ID / 교사 성명
              </label>
              <input
                type="text"
                value={inputTeacherId}
                onChange={(e) => setInputTeacherId(e.target.value)}
                placeholder="예: 신유진, 이진호, 이보건 등"
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#008b8b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#008b8b]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#008b8b] hover:bg-[#007373] text-white rounded text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>로그인</span>
            </button>
          </form>

          <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>교육행정정보시스템(NEIS) 연계 안전 인증</span>
          </div>
        </div>
    </div>
  );

  if (isPopup) {
    return contentBody;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 select-none backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded border-2 border-[#008b8b] shadow-2xl flex flex-col overflow-hidden">
        {contentBody}
      </div>
    </div>
  );
};
