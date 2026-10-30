import React from 'react';
import {
  X,
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Eye,
  Clock,
  Type,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { NotificationSettings } from '../types/messenger';
import { playNotificationSound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onUpdateSettings: (updated: Partial<NotificationSettings>) => void;
  isPopup?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  isPopup = true,
}) => {
  if (!isOpen) return null;

  const testSound = (type: NotificationSettings['soundType']) => {
    playNotificationSound(type);
  };

  const contentBody = (
    <div className="p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 h-full bg-white">

        {/* Notification Sound Section */}
        <div className="border border-slate-200 rounded p-3 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#008b8b]" />
              <div>
                <div className="text-xs font-bold text-slate-800">쪽지 및 대화 알림음</div>
                <div className="text-[11px] text-slate-500">새 메시지 수신 시 알림음을 재생합니다.</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#008b8b]" />
            </label>
          </div>

          {settings.soundEnabled && (
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  알림음 종류 선택
                </label>
                <select
                  value={settings.soundType}
                  onChange={(e) => {
                    const sound = e.target.value as NotificationSettings['soundType'];
                    onUpdateSettings({ soundType: sound });
                    testSound(sound);
                  }}
                  className="w-full text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-[#008b8b]"
                >
                  <option value="chime1">차임 1 (쿨메신저 시그니처 톤)</option>
                  <option value="chime2">차임 2 (소프트 3화음)</option>
                  <option value="bell">오피스 벨 (맑은 단음)</option>
                  <option value="marimba">마림바 (부드러운 타격음)</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => testSound(settings.soundType)}
                className="mt-4 px-2.5 py-1 bg-white border border-[#008b8b] text-[#008b8b] hover:bg-teal-50 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>미리듣기</span>
              </button>
            </div>
          )}
        </div>

        {/* Message Preview Popup Toggle */}
        <div className="border border-slate-200 rounded p-3 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#008b8b]" />
            <div>
              <div className="text-xs font-bold text-slate-800">팝업 미리보기 표시</div>
              <div className="text-[11px] text-slate-500">수신 시 화면 우측 하단에 알림 팝업을 띄웁니다.</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.previewPopup}
              onChange={(e) => onUpdateSettings({ previewPopup: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#008b8b]" />
          </label>
        </div>

        {/* Quiet Hours (수업 시간 방해 금지) */}
        <div className="border border-slate-200 rounded p-3 bg-slate-50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#008b8b]" />
              <div>
                <div className="text-xs font-bold text-slate-800">수업 시간 방해 금지 모드</div>
                <div className="text-[11px] text-slate-500">설정한 시간 동안 알림 소리를 무음으로 전환합니다.</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.quietHours}
                onChange={(e) => onUpdateSettings({ quietHours: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#008b8b]" />
            </label>
          </div>

          {settings.quietHours && (
            <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs text-slate-700">
              <span>적용 시간:</span>
              <input
                type="time"
                value={settings.quietStart}
                onChange={(e) => onUpdateSettings({ quietStart: e.target.value })}
                className="border border-slate-300 rounded px-2 py-0.5 bg-white text-xs"
              />
              <span>~</span>
              <input
                type="time"
                value={settings.quietEnd}
                onChange={(e) => onUpdateSettings({ quietEnd: e.target.value })}
                className="border border-slate-300 rounded px-2 py-0.5 bg-white text-xs"
              />
            </div>
          )}
        </div>

        {/* Font Size Preferences */}
        <div className="border border-slate-200 rounded p-3 bg-slate-50 space-y-2">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-[#008b8b]" />
            <div className="text-xs font-bold text-slate-800">글자 크기 설정</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {(
              [
                { id: 'normal', label: '보통 (14px)' },
                { id: 'large', label: '크게 (16px)' },
                { id: 'huge', label: '아주 크게 (18px)' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onUpdateSettings({ fontSize: f.id })}
                className={`py-1.5 px-2 rounded border text-center font-medium transition-colors ${
                  settings.fontSize === f.id
                    ? 'border-[#008b8b] bg-teal-50 text-[#008b8b] font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#008b8b] hover:bg-[#007373] text-white rounded text-xs font-bold transition-colors"
          >
            설정 완료
          </button>
        </div>
    </div>
  );

  if (isPopup) {
    return contentBody;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-md rounded border-2 border-[#008b8b] shadow-2xl p-4 flex flex-col gap-3 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="font-bold text-sm text-[#008b8b] flex items-center gap-1.5">
            <Bell className="w-4 h-4" />
            알림 및 환경 설정
          </span>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        {contentBody}
      </div>
    </div>
  );
};
