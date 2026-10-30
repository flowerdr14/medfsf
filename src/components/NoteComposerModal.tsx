import React, { useState, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Paperclip,
  Clock,
  Send,
  Save,
  Trash2,
  Calendar,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { FileAttachment, TeacherUser } from '../types/messenger';
import { SAMPLE_ACTIVITY_PHOTO, SAMPLE_SCIENCE_VIDEO } from '../data/mockData';

interface NoteComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (noteData: {
    recipientIds: string[];
    title: string;
    content: string;
    attachments: FileAttachment[];
    isScheduled: boolean;
    scheduledTime?: string;
  }) => void;
  onSaveDraft: (draftData: {
    recipientIds: string[];
    title: string;
    content: string;
    attachments: FileAttachment[];
  }) => void;
  allTeachers: TeacherUser[];
  initialRecipientIds?: string[];
  replyToNoteTitle?: string;
  isPopup?: boolean;
}

export const NoteComposerModal: React.FC<NoteComposerModalProps> = ({
  isOpen,
  onClose,
  onSend,
  onSaveDraft,
  allTeachers,
  initialRecipientIds = [],
  replyToNoteTitle,
  isPopup = true,
}) => {
  if (!isOpen) return null;

  const [recipientIds, setRecipientIds] = useState<string[]>(initialRecipientIds);
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [title, setTitle] = useState(replyToNoteTitle ? `[답장] ${replyToNoteTitle}` : '');
  const [content, setContent] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return d.toISOString().slice(0, 16);
  });

  // Formatting styles
  const [fontFamily, setFontFamily] = useState('굴림체');
  const [fontSize, setFontSize] = useState('14px');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [textColor, setTextColor] = useState('#1e293b');

  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Recipient removal
  const removeRecipient = (id: string) => {
    setRecipientIds((prev) => prev.filter((rId) => rId !== id));
  };

  const toggleRecipient = (id: string) => {
    setRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  // Add sample media or uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      const newAtt: FileAttachment = {
        id: `att-${Date.now()}-${i}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type,
        url,
      };
      setAttachments((prev) => [...prev, newAtt]);
    }
  };

  const handleAddSampleImage = () => {
    setAttachments((prev) => [
      ...prev,
      {
        id: `att-img-${Date.now()}`,
        name: '수업_활동사진_샘플.jpg',
        size: '2.8 MB',
        type: 'image',
        url: SAMPLE_ACTIVITY_PHOTO,
      },
    ]);
  };

  const handleAddSampleVideo = () => {
    setAttachments((prev) => [
      ...prev,
      {
        id: `att-vid-${Date.now()}`,
        name: '과학_실험_관찰영상.mp4',
        size: '14.2 MB',
        type: 'video',
        url: SAMPLE_SCIENCE_VIDEO.url,
        duration: '0:15',
      },
    ]);
  };

  const removeAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSend = () => {
    if (recipientIds.length === 0) {
      setValidationError('수신자를 1명 이상 선택해 주세요.');
      return;
    }
    if (!content.trim() && attachments.length === 0) {
      setValidationError('쪽지 내용을 입력하거나 파일을 첨부해 주세요.');
      return;
    }
    setValidationError(null);

    onSend({
      recipientIds,
      title: title.trim() || '쪽지',
      content,
      attachments,
      isScheduled,
      scheduledTime: isScheduled ? scheduledDateTime.replace('T', ' ') : undefined,
    });
    onClose();
  };

  const handleDraft = () => {
    onSaveDraft({
      recipientIds,
      title: title.trim() || '임시 저장 쪽지',
      content,
      attachments,
    });
    onClose();
  };

  // Get recipient names
  const recipientTeachers = allTeachers.filter((t) => recipientIds.includes(t.id));

  const contentBody = (
    <div className="p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 h-full bg-white">
      {validationError && (
        <div className="bg-rose-50 border border-rose-300 text-rose-700 px-3 py-2 rounded text-xs flex items-center justify-between">
          <span>{validationError}</span>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-rose-500 hover:text-rose-800 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}
      {/* Recipients Section */}
          <div className="border border-teal-200 rounded p-2.5 bg-teal-50/40">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-[70px] text-xs font-semibold text-[#008b8b] pt-1">
                <span>수신자:</span>
                <span className="text-[11px] font-normal text-slate-500">
                  ({recipientIds.length}명)
                </span>
              </div>

              {/* Recipient Chips */}
              <div className="flex-1 flex flex-wrap gap-1.5 items-center">
                {recipientTeachers.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-teal-300 text-slate-800 rounded text-xs shadow-xs"
                  >
                    <span>
                      {t.name} <span className="text-[10px] text-slate-500">({t.role})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRecipient(t.id)}
                      className="text-slate-400 hover:text-red-500 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Add Recipient Button */}
                <button
                  type="button"
                  onClick={() => setShowRecipientPicker(!showRecipientPicker)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 border border-dashed border-[#008b8b] text-[#008b8b] hover:bg-teal-50 rounded text-xs transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>수신자 추가</span>
                </button>
              </div>
            </div>

            {/* Recipient Quick Picker Dropdown */}
            {showRecipientPicker && (
              <div className="mt-2 pt-2 border-t border-teal-200 max-h-40 overflow-y-auto custom-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-1 bg-white p-2 rounded border">
                {allTeachers.map((t) => {
                  const isChecked = recipientIds.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className="flex items-center gap-1.5 text-xs text-slate-700 hover:bg-teal-50 p-1 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRecipient(t.id)}
                        className="square-checkbox"
                      />
                      <span className="truncate">
                        {t.name} <span className="text-[10px] text-slate-500">({t.role})</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Title input */}
          <div className="flex items-center gap-2 border border-teal-200 rounded px-2.5 py-1.5 bg-white">
            <span className="text-xs font-semibold text-[#008b8b] min-w-[70px]">제목:</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="쪽지 제목을 입력하세요."
              className="flex-1 text-sm focus:outline-none text-slate-800"
            />
          </div>

          {/* Scheduled Message Option (메시지 예약 전송 기능) */}
          <div className="border border-teal-200 rounded p-2.5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#008b8b] min-w-[70px]">발송 시간:</span>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                  <input
                    type="radio"
                    name="sendMode"
                    checked={!isScheduled}
                    onChange={() => setIsScheduled(false)}
                    className="accent-[#008b8b]"
                  />
                  <span>즉시 전송</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[#008b8b]">
                  <input
                    type="radio"
                    name="sendMode"
                    checked={isScheduled}
                    onChange={() => setIsScheduled(true)}
                    className="accent-[#008b8b]"
                  />
                  <Clock className="w-3.5 h-3.5" />
                  <span>메시지 예약 전송</span>
                </label>
              </div>
            </div>

            {isScheduled && (
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="border border-[#008b8b] rounded px-2 py-1 text-xs text-slate-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    d.setHours(8, 30, 0, 0);
                    setScheduledDateTime(d.toISOString().slice(0, 16));
                  }}
                  className="px-2 py-1 bg-teal-100 hover:bg-teal-200 text-[#008b8b] rounded text-[11px]"
                >
                  내일 08:30
                </button>
              </div>
            )}
          </div>

          {/* Note Content Header & Formatting Toolbar matching Screenshot 10 */}
          <div className="border border-[#008b8b] rounded overflow-hidden flex flex-col bg-white">
            <div className="px-3 py-1.5 bg-teal-50/50 border-b border-teal-200 text-xs font-bold text-[#008b8b]">
              쪽지 내용
            </div>

            {/* Rich Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 border-b border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                {/* Font Family Dropdown */}
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none"
                >
                  <option value="굴림체">굴림체</option>
                  <option value="돋움체">돋움체</option>
                  <option value="바탕체">바탕체</option>
                  <option value="맑은 고딕">맑은 고딕</option>
                  <option value="Noto Sans KR">Noto Sans KR</option>
                </select>

                {/* Font Size Dropdown */}
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none"
                >
                  <option value="12px">1 (9pt)</option>
                  <option value="14px">2 (10pt)</option>
                  <option value="16px">3 (12pt)</option>
                  <option value="18px">4 (14pt)</option>
                  <option value="22px">5 (18pt)</option>
                </select>

                <div className="h-4 w-px bg-slate-300 mx-1" />

                {/* Styling buttons */}
                <button
                  type="button"
                  onClick={() => setIsBold(!isBold)}
                  className={`w-6 h-6 flex items-center justify-center font-bold text-xs rounded border ${
                    isBold ? 'bg-slate-300 border-slate-400' : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
                  title="굵게"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => setIsItalic(!isItalic)}
                  className={`w-6 h-6 flex items-center justify-center italic text-xs rounded border ${
                    isItalic ? 'bg-slate-300 border-slate-400' : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
                  title="기울임"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => setIsUnderline(!isUnderline)}
                  className={`w-6 h-6 flex items-center justify-center underline text-xs rounded border ${
                    isUnderline ? 'bg-slate-300 border-slate-400' : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
                  title="밑줄"
                >
                  U
                </button>
                <button
                  type="button"
                  onClick={() => setIsStrike(!isStrike)}
                  className={`w-6 h-6 flex items-center justify-center line-through text-xs rounded border ${
                    isStrike ? 'bg-slate-300 border-slate-400' : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
                  title="취소선"
                >
                  S
                </button>

                {/* Text color picker */}
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-6 h-6 p-0 border border-slate-300 rounded cursor-pointer"
                  title="글자 색상"
                />

                <div className="h-4 w-px bg-slate-300 mx-1" />

                {/* Media Attachment buttons */}
                <div className="flex items-center gap-1">
                  {/* Photo Upload */}
                  <label className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer text-slate-700">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>사진 첨부</span>
                    <input
                      type="file"
                      ref={imageInputRef}
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload(e, 'image')}
                      className="hidden"
                    />
                  </label>

                  {/* Video Upload */}
                  <label className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer text-slate-700">
                    <VideoIcon className="w-3.5 h-3.5 text-purple-600" />
                    <span>동영상 첨부</span>
                    <input
                      type="file"
                      ref={videoInputRef}
                      accept="video/*"
                      multiple
                      onChange={(e) => handleFileUpload(e, 'video')}
                      className="hidden"
                    />
                  </label>

                  {/* Document Upload */}
                  <label className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer text-slate-700">
                    <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                    <span>파일 첨부</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      onChange={(e) => handleFileUpload(e, 'file')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Action buttons matching Screenshot 10 */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDraft}
                  className="px-3 py-1.5 bg-[#008b8b] hover:bg-[#007373] text-white rounded text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>임시저장</span>
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  className="px-4 py-1.5 bg-[#008b8b] hover:bg-[#007373] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isScheduled ? '예약 전송' : '전송'}</span>
                </button>
              </div>
            </div>

            {/* Note Textarea */}
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="쪽지 입력............"
              style={{
                fontFamily,
                fontSize,
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
                textDecoration: `${isUnderline ? 'underline' : ''} ${isStrike ? 'line-through' : ''}`.trim(),
                color: textColor,
              }}
              className="w-full p-4 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Quick Sample Media Buttons */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>빠른 샘플 첨부:</span>
            <button
              type="button"
              onClick={handleAddSampleImage}
              className="px-2 py-0.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-700"
            >
              + 수업 사진 샘플
            </button>
            <button
              type="button"
              onClick={handleAddSampleVideo}
              className="px-2 py-0.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-700"
            >
              + 과학 관찰 동영상 샘플
            </button>
          </div>

          {/* Attachments Preview Area */}
          {attachments.length > 0 && (
            <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
              <div className="text-xs font-semibold text-slate-700 mb-2">
                첨부된 파일 ({attachments.length}개):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 shadow-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {att.type === 'image' && (
                        <img
                          src={att.url}
                          alt={att.name}
                          className="w-8 h-8 rounded object-cover border"
                        />
                      )}
                      {att.type === 'video' && (
                        <div className="w-8 h-8 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">
                          MP4
                        </div>
                      )}
                      {att.type === 'file' && (
                        <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                          DOC
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-800 truncate">
                          {att.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{att.size}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
    </div>
  );

  if (isPopup) {
    return contentBody;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-3xl rounded-xs border-2 border-[#008b8b] shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        <div className="flex items-center justify-between px-3 py-2 bg-white border-b-2 border-[#008b8b] select-none">
          <span className="font-bold text-base text-[#008b8b]">쪽지 전송</span>
          <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        {contentBody}
      </div>
    </div>
  );
};
