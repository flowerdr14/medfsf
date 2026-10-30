import React, { useState } from 'react';
import { X, User, Camera, Check } from 'lucide-react';
import { TeacherUser, UserStatus } from '../types/messenger';
import { MASCOT_IMAGE_URL } from '../data/mockData';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeacherUser;
  onSaveProfile: (updated: Partial<TeacherUser>) => void;
  isPopup?: boolean;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
  isPopup = true,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [department, setDepartment] = useState(currentUser.department);
  const [statusMessage, setStatusMessage] = useState(currentUser.statusMessage || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [status, setStatus] = useState<UserStatus>(currentUser.status);
  const [avatar, setAvatar] = useState(currentUser.avatar);

  const avatarPresets = [
    { label: '경원 마스코트', url: MASCOT_IMAGE_URL },
    { label: '교직원 봇 1', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=avatar1' },
    { label: '교직원 봇 2', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=avatar2' },
    { label: '교직원 봇 3', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=avatar3' },
  ];

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatar(url);
  };

  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg('이름을 입력해 주세요.');
      return;
    }
    setErrorMsg('');
    onSaveProfile({
      name: name.trim(),
      role: role.trim(),
      department: department.trim(),
      statusMessage: statusMessage.trim(),
      bio: bio.trim(),
      status,
      avatar,
    });
    onClose();
  };

  const contentBody = (
    <div className="p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 h-full bg-white">
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-2 py-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-[#008b8b] overflow-hidden bg-slate-50 p-1 shadow-sm">
              <img
                src={avatar}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-[#008b8b] text-white rounded-full cursor-pointer hover:bg-[#007373] shadow-xs" title="사진 업로드">
              <Camera className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Preset Avatar Selection */}
          <div className="flex items-center gap-2 mt-1">
            {avatarPresets.map((preset, idx) => (
              <img
                key={idx}
                src={preset.url}
                alt={preset.label}
                onClick={() => setAvatar(preset.url)}
                className={`w-7 h-7 rounded-full border cursor-pointer object-cover hover:scale-110 transition-transform ${
                  avatar === preset.url ? 'ring-2 ring-[#008b8b] border-transparent' : 'border-slate-300'
                }`}
                title={preset.label}
              />
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-2.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#008b8b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">부서/학년</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1.5 text-slate-800 focus:outline-none focus:border-[#008b8b]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">직책/역할</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1.5 text-slate-800 focus:outline-none focus:border-[#008b8b]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">상태 메시지</label>
            <input
              type="text"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              placeholder="예: 2교시~4교시 수업 중, 교감실 회의"
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#008b8b]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">근무/활동 상태</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'online', label: '온라인', color: 'bg-emerald-500' },
                  { id: 'class', label: '수업중', color: 'bg-amber-500' },
                  { id: 'meeting', label: '회의중', color: 'bg-purple-500' },
                  { id: 'away', label: '자리비움', color: 'bg-yellow-500' },
                  { id: 'offline', label: '퇴근/오프라인', color: 'bg-slate-400' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatus(st.id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded border text-[11px] ${
                    status === st.id
                      ? 'border-[#008b8b] bg-teal-50 font-bold text-[#008b8b]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${st.color}`} />
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">자기소개</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자기소개를 입력하세요."
              className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:border-[#008b8b] resize-none"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="text-xs text-rose-500 font-medium bg-rose-50 border border-rose-200 px-3 py-1.5 rounded">
            {errorMsg}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#008b8b] hover:bg-[#007373] text-white rounded text-xs font-bold transition-colors"
          >
            저장
          </button>
        </div>
    </div>
  );

  if (isPopup) {
    return contentBody;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-md rounded border-2 border-[#008b8b] shadow-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="font-bold text-sm text-[#008b8b]">사용자 프로필 관리</span>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        {contentBody}
      </div>
    </div>
  );
};
