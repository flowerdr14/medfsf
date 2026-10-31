import React, { useState } from 'react';
import {
  X,
  Mail,
  Reply,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Play,
  FileText,
  Maximize2,
  Users,
  Plus,
} from 'lucide-react';
import { Note, FileAttachment, TeacherUser } from '../types/messenger';

interface NoteViewerModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onReply: (note: Note) => void;
  allTeachers: TeacherUser[];
  onOpenMedia: (att: FileAttachment) => void;
  isPopup?: boolean;
  onOpenNewCompose?: () => void;
}

export const NoteViewerModal: React.FC<NoteViewerModalProps> = ({
  note,
  isOpen,
  onClose,
  onReply,
  allTeachers,
  onOpenMedia,
  isPopup = true,
  onOpenNewCompose,
}) => {
  if (!isOpen || !note) return null;

  const [showReadDetails, setShowReadDetails] = useState(false);

  // Calculate read count
  const readReceiptKeys = Object.keys(note.readReceipts || {});
  const totalRecipients = note.recipientIds.length;
  const readCount = readReceiptKeys.length;

  const contentBody = (
    <div className="flex-1 flex flex-col overflow-hidden h-full bg-white">
      <div className="p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
        {/* Metadata Box matching Screenshot 6 */}
          <div className="border border-[#008b8b] rounded p-3 bg-white space-y-2">
            {/* Sender */}
            <div className="flex items-center text-sm">
              <span className="text-[#008b8b] font-semibold min-w-[80px]">발신자:</span>
              <span className="font-medium text-slate-900">
                {note.senderName} ({note.senderRole})
              </span>
            </div>

            {/* Recipient */}
            <div className="flex items-start text-sm">
              <span className="text-[#008b8b] font-semibold min-w-[80px] pt-0.5">수신자:</span>
              <div className="flex-1 flex flex-wrap items-center gap-1.5">
                {note.recipientNames && note.recipientNames.length > 0
                  ? note.recipientNames.map((name, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-teal-50 border border-teal-200 rounded text-xs text-slate-800"
                      >
                        {name}
                      </span>
                    ))
                  : note.recipientIds.map((id) => {
                      const t = allTeachers.find((tch) => tch.id === id);
                      return (
                        <span
                          key={id}
                          className="px-2 py-0.5 bg-teal-50 border border-teal-200 rounded text-xs text-slate-800"
                        >
                          {t ? `${t.name} (${t.role})` : id}
                        </span>
                      );
                    })}

                {/* Read Confirmation Badge & Detailed Viewer Button */}
                <button
                  type="button"
                  onClick={() => setShowReadDetails(!showReadDetails)}
                  className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs font-medium hover:bg-emerald-100 transition-colors"
                  title="수신자 읽음 확인 상세 보기"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>읽음 확인: {readCount}/{totalRecipients}명</span>
                </button>
              </div>
            </div>

            {/* Read Receipt Details Expansion */}
            {showReadDetails && (
              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5 animate-in fade-in duration-150">
                <div className="font-semibold text-slate-700 flex items-center justify-between border-b pb-1">
                  <span>수신자별 열람 현황</span>
                  <span className="text-[11px] text-slate-500">
                    전체 {totalRecipients}명 중 {readCount}명 열람 완료
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                  {note.recipientIds.map((rId) => {
                    const teacher = allTeachers.find((t) => t.id === rId);
                    const readTime = note.readReceipts[rId];
                    const isRead = !!readTime;
                    return (
                      <div
                        key={rId}
                        className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-100 text-[11px]"
                      >
                        <span className="font-medium text-slate-800">
                          {teacher ? `${teacher.name} (${teacher.role})` : rId}
                        </span>
                        {isRead ? (
                          <span className="text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {readTime.slice(11, 16)} 읽음
                          </span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            미열람
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Send Time */}
            <div className="flex items-center text-sm">
              <span className="text-[#008b8b] font-semibold min-w-[80px]">발송 시간:</span>
              <span className="text-slate-600 text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {note.sentAt}
                {note.isScheduled && (
                  <span className="ml-2 px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded text-[10px] font-semibold">
                    예약 발송 완료
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Note Content Box matching Screenshot 6 */}
          <div className="border border-[#008b8b] rounded flex flex-col bg-white overflow-hidden">
            <div className="px-3 py-1.5 bg-teal-50/50 border-b border-teal-200 text-xs font-bold text-[#008b8b] flex items-center justify-between">
              <span>쪽지 내용: {note.title}</span>
            </div>

            <div className="p-4 min-h-[160px] text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {note.content}
            </div>

            {/* Attachments Section */}
            {note.attachments && note.attachments.length > 0 && (
              <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700">
                  첨부 파일 ({note.attachments.length}개)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {note.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-2 bg-white rounded border border-slate-200 shadow-xs flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {att.type === 'image' && (
                            <img
                              src={att.url}
                              alt={att.name}
                              className="w-10 h-10 rounded object-cover border cursor-pointer hover:opacity-90"
                              onClick={() => onOpenMedia(att)}
                            />
                          )}
                          {att.type === 'video' && (
                            <div
                              onClick={() => onOpenMedia(att)}
                              className="w-10 h-10 rounded bg-purple-100 text-purple-700 flex items-center justify-center cursor-pointer hover:bg-purple-200"
                            >
                              <Play className="w-5 h-5 fill-purple-700" />
                            </div>
                          )}
                          {att.type === 'file' && (
                            <div className="w-10 h-10 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center">
                              <FileText className="w-5 h-5" />
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
                          onClick={() => onOpenMedia(att)}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-[#008b8b] rounded text-xs flex items-center gap-1 font-medium"
                        >
                          {att.type === 'image' || att.type === 'video' ? '보기' : '다운로드'}
                        </button>
                      </div>

                      {/* In-place preview for video if video */}
                      {att.type === 'video' && (
                        <div className="mt-1 rounded overflow-hidden bg-black max-h-48 flex justify-center">
                          <video
                            src={att.url}
                            controls
                            className="max-h-48 w-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100"
          >
            닫기
          </button>

          <div className="flex items-center gap-2">
            {onOpenNewCompose && (
              <button
                type="button"
                onClick={onOpenNewCompose}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded text-xs font-bold shadow-xs flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
                title="새 쪽지 작성창 하나 더 띄우기"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>새 쪽지창 띄우기</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onReply(note)}
              className="px-4 py-1.5 bg-[#008b8b] hover:bg-[#007373] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              title="이 쪽지를 보면서 답장 쪽지창 띄우기"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>답장 쓰기 (새 팝업창)</span>
            </button>
          </div>
        </div>
    </div>
  );

  if (isPopup) {
    return contentBody;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-2xl rounded-xs border-2 border-[#008b8b] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-3 py-2 bg-white border-b-2 border-[#008b8b] select-none">
          <span className="font-bold text-base text-[#008b8b]">쪽지 받기</span>
          <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        {contentBody}
      </div>
    </div>
  );
};
