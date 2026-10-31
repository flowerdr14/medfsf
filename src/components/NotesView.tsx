import React, { useState, useMemo } from 'react';
import {
  Home,
  Search,
  Calendar,
  X,
  Paperclip,
  CheckCircle2,
  Clock,
  Plus,
  Play,
  Reply,
  Trash2,
  Send,
  Video,
  Image as ImageIcon,
  Maximize2,
} from 'lucide-react';
import { Note, FileAttachment, TeacherUser } from '../types/messenger';

interface NotesViewProps {
  type: 'received' | 'sent';
  notes: Note[];
  currentUserId: string;
  allTeachers: TeacherUser[];
  onOpenCompose: (recipientIds?: string[]) => void;
  onOpenMedia: (att: FileAttachment) => void;
  onDeleteNote: (noteId: string) => void;
  onSendScheduledNow: (noteId: string) => void;
  onOpenNotePopup?: (note: Note) => void;
  onMarkAsRead?: (noteId: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  type,
  notes,
  currentUserId,
  allTeachers,
  onOpenCompose,
  onOpenMedia,
  onDeleteNote,
  onSendScheduledNow,
  onOpenNotePopup,
  onMarkAsRead,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'hasAttachments' | 'scheduled'>('all');
  const [showCalendarFilter, setShowCalendarFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchContent = n.content.toLowerCase().includes(q);
        const matchSender = n.senderName.toLowerCase().includes(q);
        const matchRecipients = (n.recipientNames || []).some((r) => r.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchSender && !matchRecipients) return false;
      }

      // Date filter
      if (dateFilter) {
        if (!n.sentAt.startsWith(dateFilter)) return false;
      }

      // Sub-tab filter
      if (filterMode === 'unread') {
        if (type === 'received') {
          return !n.readReceipts[currentUserId];
        } else {
          // Sent notes: check if not everyone read it
          return Object.keys(n.readReceipts || {}).length < n.recipientIds.length;
        }
      }
      if (filterMode === 'hasAttachments') {
        return n.attachments && n.attachments.length > 0;
      }
      if (filterMode === 'scheduled') {
        return n.isScheduled;
      }

      return true;
    });
  }, [notes, searchQuery, dateFilter, filterMode, type, currentUserId]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || filteredNotes[0] || null;

  // Mark selected note as read when viewed
  React.useEffect(() => {
    if (selectedNote && type === 'received' && onMarkAsRead) {
      if (!selectedNote.readReceipts[currentUserId]) {
        onMarkAsRead(selectedNote.id);
      }
    }
  }, [selectedNote?.id, type, currentUserId, onMarkAsRead]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white select-none">
      {/* Breadcrumb Header matching Screenshot 7 & 8 */}
      <div className="px-4 py-2 bg-white border-b-2 border-[#008b8b] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-base font-bold text-[#008b8b]">
          <Home className="w-5 h-5 text-[#008b8b]" />
          <span>홈 &gt; {type === 'received' ? '받은 쪽지' : '보낸 쪽지'}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenCompose()}
            className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold rounded flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
            title="새 쪽지 작성창 하나 더 띄우기"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>새 쪽지창 띄우기</span>
          </button>
        </div>
      </div>

      {/* Search & Tool Bar matching Screenshot 7 */}
      <div className="p-3 border-b border-teal-200 bg-white flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input with Integrated Search & Calendar */}
        <div className="flex-1 w-full relative flex items-center">
          <div className="w-full bg-[#e6f7f7] border border-[#a2e0e0] rounded-full px-3 py-1.5 flex items-center gap-2 shadow-inner">
            <Search className="w-4 h-4 text-teal-700 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="대화내용 검색"
              className="bg-transparent border-none text-xs text-slate-800 placeholder-teal-800/60 focus:outline-none flex-1"
            />
            <span className="text-teal-400 text-xs">|</span>
            <span className="text-xs text-teal-800 whitespace-nowrap">통합검색</span>
            <button
              type="button"
              onClick={() => setShowCalendarFilter(!showCalendarFilter)}
              className="text-teal-700 hover:text-teal-900 p-0.5"
              title="날짜별 검색"
            >
              <Calendar className="w-4 h-4" />
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-teal-700 hover:text-teal-900 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterMode === 'all'
                ? 'bg-[#008b8b] text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('unread')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterMode === 'unread'
                ? 'bg-[#008b8b] text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            안읽음
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('hasAttachments')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterMode === 'hasAttachments'
                ? 'bg-[#008b8b] text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            첨부파일
          </button>
          {type === 'sent' && (
            <button
              type="button"
              onClick={() => setFilterMode('scheduled')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterMode === 'scheduled'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              예약 발송함
            </button>
          )}
        </div>
      </div>

      {/* Date Filter Bar */}
      {showCalendarFilter && (
        <div className="px-3 py-2 bg-teal-50/70 border-b border-teal-200 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">날짜 선택:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-[#008b8b] rounded px-2 py-0.5 text-xs bg-white text-slate-800"
            />
          </div>
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="text-slate-500 hover:text-red-500 text-xs underline"
            >
              날짜 필터 해제
            </button>
          )}
        </div>
      )}

      {/* Split Panels matching Screenshot 7 & 8 */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Subpanel: 쪽지내역 */}
        <div className="w-[280px] sm:w-[320px] border-r-2 border-[#008b8b] flex flex-col bg-white">
          <div className="px-3 py-2 bg-[#008b8b] text-white font-bold text-sm tracking-wide text-center">
            쪽지내역
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                조회된 쪽지가 없습니다.
              </div>
            ) : (
              filteredNotes.map((n) => {
                const isSelected = selectedNote?.id === n.id;
                const isReadByMe = !!n.readReceipts[currentUserId];
                const readCount = Object.keys(n.readReceipts || {}).length;
                const hasMedia = n.attachments && n.attachments.length > 0;

                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      setSelectedNoteId(n.id);
                      if (onOpenNotePopup) {
                        onOpenNotePopup(n);
                      }
                    }}
                    className={`p-3 cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-teal-50/90 font-medium'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {type === 'received' ? n.senderName : n.recipientNames?.join(', ') || '수신자'}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                        {n.sentAt.slice(5, 16)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 truncate mb-1">
                      {n.title}
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      {/* Read status & Scheduled tag */}
                      <div className="flex items-center gap-1.5">
                        {n.isScheduled ? (
                          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded text-[10px] font-semibold flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            예약 {n.scheduledTime?.slice(11, 16)}
                          </span>
                        ) : type === 'received' ? (
                          isReadByMe ? (
                            <span className="text-slate-400 text-[10px]">읽음</span>
                          ) : (
                            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold">
                              안읽음
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500 text-[10px]">
                            읽음 {readCount}/{n.recipientIds.length}
                          </span>
                        )}
                      </div>

                      {hasMedia && (
                        <div className="flex items-center gap-1 text-slate-400">
                          {n.attachments.some((a) => a.type === 'image') && (
                            <ImageIcon className="w-3 h-3 text-blue-500" />
                          )}
                          {n.attachments.some((a) => a.type === 'video') && (
                            <Video className="w-3 h-3 text-purple-500" />
                          )}
                          <Paperclip className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Subpanel: 쪽지 내용 */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="px-4 py-2 bg-[#008b8b] text-white font-bold text-sm tracking-wide text-center">
            쪽지 내용
          </div>

          {selectedNote ? (
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 gap-4">
              {/* Header Box */}
              <div className="border border-teal-200 rounded p-3 bg-teal-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-900">
                    {selectedNote.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenCompose([type === 'received' ? selectedNote.senderId : selectedNote.recipientIds[0]])}
                      className="px-3 py-1.5 bg-white border border-[#008b8b] text-[#008b8b] hover:bg-teal-50 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      title="답장 작성하기"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>답장</span>
                    </button>
                    {selectedNote.isScheduled && (
                      <button
                        type="button"
                        onClick={() => onSendScheduledNow(selectedNote.id)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>지금 즉시 발송</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteNote(selectedNote.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      title="쪽지 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-[#008b8b] mr-2">발신자:</span>
                    <span>{selectedNote.senderName} ({selectedNote.senderRole})</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#008b8b] mr-2">발송 시간:</span>
                    <span>{selectedNote.sentAt}</span>
                  </div>
                  <div className="sm:col-span-2 flex items-start gap-1">
                    <span className="font-semibold text-[#008b8b] mr-2 shrink-0">수신자:</span>
                    <span className="text-slate-800">
                      {selectedNote.recipientNames?.join(', ') || '전체 수신자'}
                    </span>
                  </div>
                </div>

                {/* Read Confirmation status */}
                <div className="pt-2 border-t border-teal-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-medium">
                      읽음 확인: {Object.keys(selectedNote.readReceipts || {}).length}/
                      {selectedNote.recipientIds.length}명 열람
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    {selectedNote.isScheduled ? '예약 메시지 상태' : '전송 완료'}
                  </span>
                </div>
              </div>

              {/* Note Body Text */}
              <div className="p-4 bg-white border border-slate-200 rounded min-h-[160px] text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedNote.content}
              </div>

              {/* Attached Photos and Videos */}
              {selectedNote.attachments && selectedNote.attachments.length > 0 && (
                <div className="border border-slate-200 rounded p-3 bg-slate-50 space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>첨부 파일 ({selectedNote.attachments.length}개)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedNote.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-2.5 bg-white rounded border border-slate-200 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {att.name}
                          </span>
                          <span className="text-[10px] text-slate-400">{att.size}</span>
                        </div>

                        {att.type === 'image' && (
                          <div
                            onClick={() => onOpenMedia(att)}
                            className="relative group rounded overflow-hidden cursor-pointer max-h-48 border"
                          >
                            <img
                              src={att.url}
                              alt={att.name}
                              className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity">
                              클릭하여 사진 확대 보기
                            </div>
                          </div>
                        )}

                        {att.type === 'video' && (
                          <div className="rounded overflow-hidden bg-black max-h-48 flex justify-center">
                            <video
                              src={att.url}
                              controls
                              className="w-full max-h-48 object-contain"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenMedia(att)}
                            className="px-2 py-0.5 bg-teal-50 hover:bg-teal-100 text-[#008b8b] rounded text-xs font-medium"
                          >
                            {att.type === 'file' ? '다운로드' : '자세히 보기'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              쪽지를 선택해 주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
