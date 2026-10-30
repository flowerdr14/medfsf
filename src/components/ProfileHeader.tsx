import React, { useState } from 'react';
import { Pencil, UserCheck, Shield } from 'lucide-react';
import { TeacherUser } from '../types/messenger';

interface ProfileHeaderProps {
  currentUser: TeacherUser;
  onUpdateBio: (newName: string, newBio: string) => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  currentUser,
  onUpdateBio,
  onOpenProfile,
  onOpenLogin,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [nameVal, setNameVal] = useState(currentUser.name);
  const [bioVal, setBioVal] = useState(currentUser.statusMessage || currentUser.bio || '');

  // Keep internal values synced when currentUser changes
  React.useEffect(() => {
    setNameVal(currentUser.name);
    setBioVal(currentUser.statusMessage || currentUser.bio || '');
  }, [currentUser]);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (nameVal.trim()) {
      onUpdateBio(nameVal.trim(), bioVal);
    } else {
      setNameVal(currentUser.name);
    }
  };

  const handleBioBlur = () => {
    setIsEditingBio(false);
    onUpdateBio(nameVal, bioVal.trim());
  };

  const getStatusColor = (status: TeacherUser['status']) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-400';
      case 'class':
        return 'bg-amber-400';
      case 'meeting':
        return 'bg-purple-400';
      case 'away':
        return 'bg-yellow-400';
      default:
        return 'bg-slate-400';
    }
  };

  const getStatusLabel = (status: TeacherUser['status']) => {
    switch (status) {
      case 'online':
        return '온라인';
      case 'class':
        return '수업중';
      case 'meeting':
        return '회의중';
      case 'away':
        return '자리비움';
      default:
        return '오프라인';
    }
  };

  return (
    <div className="w-full bg-[#008b8b] px-4 py-2.5 flex items-center gap-3 sm:gap-4 text-white border-b border-[#007373] shadow-xs select-none">
      {/* Left circular mascot avatar with status indicator matching Screenshot 2 */}
      <div
        className="relative group cursor-pointer shrink-0"
        onClick={onOpenProfile}
        title="프로필 상세 설정 / 사진 변경"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-0.5 shadow-md border-2 border-slate-900 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-full h-full rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <span
          className={`absolute bottom-0 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusColor(
            currentUser.status
          )} shadow-xs`}
          title={`현재 상태: ${getStatusLabel(currentUser.status)}`}
        />
      </div>

      {/* Two stacked white input boxes matching Screenshot 2 */}
      <div className="flex-1 flex flex-col gap-1.5 max-w-xl">
        {/* Row 1: Name input box */}
        <div className="w-full bg-white text-slate-900 rounded-sm border-2 border-slate-900 px-3 py-1 flex items-center justify-between shadow-xs">
          {isEditingName ? (
            <input
              type="text"
              value={nameVal}
              autoFocus
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              className="w-full text-xs font-bold text-slate-800 focus:outline-none bg-transparent"
              placeholder="이름을 입력하세요."
            />
          ) : (
            <div
              onClick={() => setIsEditingName(true)}
              className="text-xs font-bold text-slate-800 truncate cursor-pointer flex-1 flex items-center gap-1.5"
              title="클릭하여 이름 수정"
            >
              <span>{currentUser.name}</span>
              <span className="text-[11px] font-normal text-slate-500">
                ({currentUser.department} · {currentUser.role})
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsEditingName(!isEditingName)}
            className="text-slate-700 hover:text-slate-950 p-0.5"
            aria-label="이름 수정"
          >
            <Pencil className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>

        {/* Row 2: Status / Bio input box */}
        <div className="w-full bg-white text-slate-900 rounded-sm border-2 border-slate-900 px-3 py-1 flex items-center justify-between shadow-xs">
          {isEditingBio ? (
            <input
              type="text"
              value={bioVal}
              autoFocus
              onChange={(e) => setBioVal(e.target.value)}
              onBlur={handleBioBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleBioBlur()}
              className="w-full text-xs text-slate-700 focus:outline-none bg-transparent"
              placeholder="자기소개를 입력하세요."
            />
          ) : (
            <span
              onClick={() => setIsEditingBio(true)}
              className="text-xs text-slate-700 truncate cursor-pointer flex-1"
              title={currentUser.statusMessage || currentUser.bio || '자기소개를 입력하세요.'}
            >
              {currentUser.statusMessage || currentUser.bio || '자기소개를 입력하세요.'}
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsEditingBio(!isEditingBio)}
            className="text-slate-700 hover:text-slate-950 p-0.5"
            aria-label="자기소개 수정"
          >
            <Pencil className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Right controls: Quick user switch / status indicator */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenProfile}
          className="px-2.5 py-1.5 bg-teal-800/50 hover:bg-teal-800 text-white text-xs font-semibold rounded border border-teal-600/60 flex items-center gap-1.5 transition-colors"
          title="내 프로필 상세 설정"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>프로필 설정</span>
        </button>

        <button
          type="button"
          onClick={onOpenLogin}
          className="px-2.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold rounded border border-teal-500/60 flex items-center gap-1.5 transition-colors"
          title="다른 교사 계정으로 전환"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>교사 전환</span>
        </button>
      </div>
    </div>
  );
};
