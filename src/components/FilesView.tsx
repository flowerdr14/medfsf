import React, { useState, useMemo } from 'react';
import {
  Home,
  Search,
  Calendar,
  X,
  Play,
  FileText,
  Download,
  Image as ImageIcon,
  Video as VideoIcon,
  Eye,
} from 'lucide-react';
import { Note, FileAttachment } from '../types/messenger';

interface FilesViewProps {
  type: 'received' | 'sent';
  notes: Note[];
  onOpenMedia: (att: FileAttachment) => void;
}

export const FilesView: React.FC<FilesViewProps> = ({
  type,
  notes,
  onOpenMedia,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'image' | 'video' | 'file'>('all');

  // Collect notes that have attachments
  const notesWithFiles = useMemo(() => {
    return notes.filter((n) => n.attachments && n.attachments.length > 0);
  }, [notes]);

  // Flatten all files with note metadata
  const allFileItems = useMemo(() => {
    const list: { note: Note; file: FileAttachment }[] = [];
    notesWithFiles.forEach((n) => {
      n.attachments.forEach((att) => {
        list.push({ note: n, file: att });
      });
    });
    return list;
  }, [notesWithFiles]);

  // Filter files
  const filteredFiles = useMemo(() => {
    return allFileItems.filter(({ note, file }) => {
      if (selectedNoteId && note.id !== selectedNoteId) return false;
      if (fileTypeFilter !== 'all' && file.type !== fileTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchFile = file.name.toLowerCase().includes(q);
        const matchTitle = note.title.toLowerCase().includes(q);
        const matchSender = note.senderName.toLowerCase().includes(q);
        if (!matchFile && !matchTitle && !matchSender) return false;
      }
      return true;
    });
  }, [allFileItems, selectedNoteId, fileTypeFilter, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white select-none">
      {/* Breadcrumb Header matching Screenshot 3 & 4 */}
      <div className="px-4 py-2 bg-white border-b-2 border-[#008b8b] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-base font-bold text-[#008b8b]">
          <Home className="w-5 h-5 text-[#008b8b]" />
          <span>홈 &gt; {type === 'received' ? '받은 파일' : '보낸 파일'}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 border-b border-teal-200 bg-white flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
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
            <Calendar className="w-4 h-4 text-teal-700" />
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

        {/* Media type buttons */}
        <div className="flex items-center gap-1 text-xs shrink-0">
          <button
            type="button"
            onClick={() => {
              setFileTypeFilter('all');
              setSelectedNoteId(null);
            }}
            className={`px-2.5 py-1 rounded transition-colors ${
              fileTypeFilter === 'all'
                ? 'bg-[#008b8b] text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체 ({allFileItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFileTypeFilter('image')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              fileTypeFilter === 'image'
                ? 'bg-[#008b8b] text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>사진</span>
          </button>
          <button
            type="button"
            onClick={() => setFileTypeFilter('video')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              fileTypeFilter === 'video'
                ? 'bg-[#008b8b] text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            <span>동영상</span>
          </button>
          <button
            type="button"
            onClick={() => setFileTypeFilter('file')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              fileTypeFilter === 'file'
                ? 'bg-[#008b8b] text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>문서</span>
          </button>
        </div>
      </div>

      {/* Split Panels matching Screenshot 3 & 4 */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Subpanel: 쪽지내역 */}
        <div className="w-[260px] sm:w-[300px] border-r-2 border-[#008b8b] flex flex-col bg-white">
          <div className="px-3 py-2 bg-[#008b8b] text-white font-bold text-sm tracking-wide text-center">
            쪽지내역
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
            {notesWithFiles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                첨부파일이 포함된 쪽지가 없습니다.
              </div>
            ) : (
              notesWithFiles.map((n) => {
                const isSelected = selectedNoteId === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() =>
                      setSelectedNoteId(isSelected ? null : n.id)
                    }
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-teal-50 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {type === 'received' ? n.senderName : n.recipientNames?.join(', ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {n.sentAt.slice(5, 10)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 truncate mb-1">
                      {n.title}
                    </div>
                    <div className="text-[11px] text-[#008b8b] font-medium">
                      파일 {n.attachments.length}개 첨부
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Subpanel: 전송 받은 파일 / 전송한 파일 */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="px-4 py-2 bg-[#008b8b] text-white font-bold text-sm tracking-wide text-center">
            {type === 'received' ? '전송 받은 파일' : '전송한 파일'}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {filteredFiles.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                해당 조건의 파일이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredFiles.map(({ note, file }) => (
                  <div
                    key={file.id}
                    className="border border-slate-200 rounded p-3 bg-white shadow-xs hover:border-[#008b8b] transition-all flex flex-col justify-between gap-2.5"
                  >
                    {/* Media Thumbnail or Type Icon */}
                    <div className="h-32 rounded bg-slate-50 border overflow-hidden flex items-center justify-center relative group">
                      {file.type === 'image' && (
                        <>
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          <div
                            onClick={() => onOpenMedia(file)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium cursor-pointer transition-opacity"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            확대 보기
                          </div>
                        </>
                      )}

                      {file.type === 'video' && (
                        <div
                          onClick={() => onOpenMedia(file)}
                          className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white cursor-pointer"
                        >
                          <Play className="w-8 h-8 fill-white/80 mb-1" />
                          <span className="text-[11px] text-white/80">동영상 재생</span>
                        </div>
                      )}

                      {file.type === 'file' && (
                        <div className="flex flex-col items-center justify-center text-emerald-700">
                          <FileText className="w-10 h-10 mb-1" />
                          <span className="text-[11px] font-bold">문서 파일</span>
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <div>
                      <div className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                        <span>{file.size}</span>
                        <span>{note.sentAt.slice(0, 10)}</span>
                      </div>
                      <div className="text-[11px] text-teal-700 truncate mt-0.5">
                        출처: {note.title}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => onOpenMedia(file)}
                        className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-[#008b8b] rounded text-xs font-medium flex items-center gap-1"
                      >
                        {file.type === 'image' || file.type === 'video' ? '미리보기' : '다운로드'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
