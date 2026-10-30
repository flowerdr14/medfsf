import React, { useState } from 'react';
import { Home, Megaphone, Plus, X, Eye, Calendar, Paperclip, FileText } from 'lucide-react';
import { Announcement, FileAttachment } from '../types/messenger';

interface NoticeBoardViewProps {
  notices: Announcement[];
  onOpenMedia: (att: FileAttachment) => void;
  onAddNotice: (notice: Omit<Announcement, 'id' | 'views'>) => void;
  currentUserName: string;
}

export const NoticeBoardView: React.FC<NoticeBoardViewProps> = ({
  notices,
  onOpenMedia,
  onAddNotice,
  currentUserName,
}) => {
  const [selectedNotice, setSelectedNotice] = useState<Announcement | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [noticeError, setNoticeError] = useState('');

  const handleCreateNotice = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      setNoticeError('공지 제목과 내용을 모두 입력해 주세요.');
      return;
    }
    setNoticeError('');
    const today = new Date().toISOString().slice(0, 10);
    onAddNotice({
      title: newTitle.trim(),
      author: currentUserName,
      department: '교무행정',
      date: today,
      content: newContent.trim(),
    });
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white select-none overflow-hidden">
      {/* Breadcrumb Header matching Screenshot 5 */}
      <div className="px-4 py-2 bg-white border-b-2 border-[#008b8b] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-base font-bold text-[#008b8b]">
          <Home className="w-5 h-5 text-[#008b8b]" />
          <span>홈 &gt; 공지</span>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1 bg-[#008b8b] hover:bg-[#007373] text-white text-xs font-semibold rounded flex items-center gap-1 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>공지사항 등록</span>
        </button>
      </div>

      {/* Table Content Area matching Screenshot 5 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="border-2 border-[#008b8b] rounded overflow-hidden shadow-xs bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#008b8b] bg-teal-50/50 text-[#008b8b] font-bold text-sm">
                <th className="py-2.5 px-4 text-center w-auto">제목</th>
                <th className="py-2.5 px-4 text-center w-36 border-l-2 border-[#008b8b]">작성자</th>
                <th className="py-2.5 px-4 text-center w-24 border-l-2 border-[#008b8b]">조회수</th>
                <th className="py-2.5 px-4 text-center w-32 border-l-2 border-[#008b8b]">작성일</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#008b8b]/40 text-xs text-slate-800">
              {notices.map((n) => (
                <tr
                  key={n.id}
                  onClick={() => setSelectedNotice(n)}
                  className="hover:bg-teal-50/60 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      {n.isPinned && (
                        <span className="px-1.5 py-0.2 bg-red-100 text-red-700 rounded text-[10px] font-bold">
                          중요
                        </span>
                      )}
                      <span className="truncate">{n.title}</span>
                      {n.attachments && n.attachments.length > 0 && (
                        <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 border-l-2 border-[#008b8b]">
                    {n.author}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 font-mono border-l-2 border-[#008b8b]">
                    {n.views}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 font-mono border-l-2 border-[#008b8b]">
                    {n.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notice Detail View Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-2xl rounded border-2 border-[#008b8b] shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
            <div className="px-4 py-2.5 bg-white border-b-2 border-[#008b8b] flex items-center justify-between">
              <span className="font-bold text-base text-[#008b8b] flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                공지사항 상세
              </span>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
              <div className="border border-teal-200 rounded p-3 bg-teal-50/50 space-y-1.5">
                <div className="text-base font-bold text-slate-900">
                  {selectedNotice.title}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span>작성자: <strong className="text-slate-800">{selectedNotice.author}</strong></span>
                  <span>부서: {selectedNotice.department}</span>
                  <span>작성일: {selectedNotice.date}</span>
                  <span>조회수: {selectedNotice.views}회</span>
                </div>
              </div>

              <div className="p-4 bg-white border rounded min-h-[180px] text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedNotice.content}
              </div>

              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <div className="border border-slate-200 rounded p-3 bg-slate-50 space-y-2">
                  <div className="text-xs font-bold text-slate-700">첨부 파일</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNotice.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 text-xs"
                      >
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span className="font-medium text-slate-800">{att.name}</span>
                        <span className="text-slate-400 text-[10px]">({att.size})</span>
                        <button
                          type="button"
                          onClick={() => onOpenMedia(att)}
                          className="px-2 py-0.5 bg-teal-50 text-[#008b8b] hover:bg-teal-100 rounded text-[11px] font-medium"
                        >
                          다운로드
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-2 bg-slate-50 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-1.5 bg-[#008b8b] hover:bg-[#007373] text-white rounded text-xs font-semibold"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded border-2 border-[#008b8b] shadow-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-sm text-[#008b8b]">공지사항 작성</span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {noticeError && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded">
                {noticeError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">제목</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="공지 제목을 입력하세요"
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008b8b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">내용</label>
              <textarea
                rows={6}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="공지 내용을 입력하세요..."
                className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800 focus:outline-none focus:border-[#008b8b] resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleCreateNotice}
                className="px-4 py-1.5 bg-[#008b8b] hover:bg-[#007373] text-white rounded text-xs font-bold"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
