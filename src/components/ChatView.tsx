import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Users,
  Plus,
  Send,
  Image as ImageIcon,
  Video as VideoIcon,
  Paperclip,
  Clock,
  Play,
  CheckCheck,
  Check,
  X,
  Search,
} from 'lucide-react';
import {
  ChatRoom,
  ChatMessage,
  TeacherUser,
  FileAttachment,
} from '../types/messenger';
import {
  SAMPLE_ACTIVITY_PHOTO,
  SAMPLE_SCIENCE_VIDEO,
} from '../data/mockData';
import { playNotificationSound } from '../utils/audio';

interface ChatViewProps {
  currentRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  chatRooms: ChatRoom[];
  messages: Record<string, ChatMessage[]>;
  currentUser: TeacherUser;
  allTeachers: TeacherUser[];
  onSendMessage: (
    roomId: string,
    text: string,
    media?: FileAttachment,
    isScheduled?: boolean,
    scheduledTime?: string
  ) => void;
  onCreateGroupRoom: (roomName: string, participantIds: string[]) => void;
  onOpenMedia: (att: FileAttachment) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentRoomId,
  onSelectRoom,
  chatRooms,
  messages,
  currentUser,
  allTeachers,
  onSendMessage,
  onCreateGroupRoom,
  onOpenMedia,
}) => {
  const [inputText, setInputText] = useState('');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    return d.toISOString().slice(0, 16);
  });
  const [attachedMedia, setAttachedMedia] = useState<FileAttachment | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const activeRoom = chatRooms.find((r) => r.id === currentRoomId) || chatRooms[0];
  const roomMessages = (activeRoom && messages[activeRoom.id]) || [];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages.length, currentRoomId]);

  const handleSend = () => {
    if (!activeRoom) return;
    if (!inputText.trim() && !attachedMedia) return;

    onSendMessage(
      activeRoom.id,
      inputText.trim(),
      attachedMedia || undefined,
      showSchedulePicker,
      showSchedulePicker ? scheduledDateTime.replace('T', ' ') : undefined
    );

    setInputText('');
    setAttachedMedia(null);
    setShowSchedulePicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAttachedMedia({
      id: `chat-att-${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type,
      url,
    });
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      alert('그룹 채팅방 이름을 입력해 주세요.');
      return;
    }
    if (selectedParticipants.length === 0) {
      alert('초대할 교직원을 1명 이상 선택해 주세요.');
      return;
    }

    onCreateGroupRoom(newGroupName.trim(), [currentUser.id, ...selectedParticipants]);
    setShowCreateGroupModal(false);
    setNewGroupName('');
    setSelectedParticipants([]);
  };

  return (
    <div className="flex-1 flex h-full bg-white select-none overflow-hidden">
      {/* Left Chat Rooms List */}
      <div className="w-[260px] sm:w-[290px] border-r-2 border-[#008b8b] flex flex-col bg-white shrink-0">
        <div className="px-3 py-2.5 bg-[#008b8b] text-white flex items-center justify-between">
          <span className="font-bold text-sm tracking-wide flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            실시간 대화 목록
          </span>
          <button
            type="button"
            onClick={() => setShowCreateGroupModal(true)}
            className="p-1 hover:bg-white/20 rounded transition-colors text-white"
            title="그룹 채팅방 생성"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
          {chatRooms.map((room) => {
            const isSelected = activeRoom?.id === room.id;
            return (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`p-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-teal-50 border-l-4 border-[#008b8b]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {room.type === 'group' ? (
                      <Users className="w-3.5 h-3.5 text-[#008b8b] shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {room.name}
                    </span>
                  </div>
                  {room.lastMessageAt && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {room.lastMessageAt}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 truncate flex-1 pr-2">
                    {room.lastMessage || '대화가 시작되었습니다.'}
                  </span>
                  {room.unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-bold">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Active Conversation Area */}
      {activeRoom ? (
        <div className="flex-1 flex flex-col h-full bg-[#f4fbfb] overflow-hidden">
          {/* Room Header */}
          <div className="px-4 py-2.5 bg-white border-b border-teal-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              {activeRoom.type === 'group' ? (
                <div className="w-8 h-8 rounded-full bg-teal-100 text-[#008b8b] flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  대화
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{activeRoom.name}</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    ({activeRoom.participantIds.length}명 참여)
                  </span>
                </div>
                <div className="text-[10px] text-[#008b8b] font-medium">
                  실시간 암호화 교직원 채널
                </div>
              </div>
            </div>

            {/* Quick Participants avatars */}
            <div className="hidden sm:flex items-center gap-1">
              {activeRoom.participantIds.slice(0, 4).map((pid) => {
                const t = allTeachers.find((tch) => tch.id === pid);
                return (
                  <span
                    key={pid}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-medium"
                    title={t ? `${t.name} (${t.role})` : pid}
                  >
                    {t?.name || '교원'}
                  </span>
                );
              })}
              {activeRoom.participantIds.length > 4 && (
                <span className="text-[10px] text-slate-500">
                  +{activeRoom.participantIds.length - 4}명
                </span>
              )}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {roomMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              // Calculate unread count for message
              // Total participants excluding sender
              const unreadCount = Math.max(
                0,
                activeRoom.participantIds.length - msg.readBy.length
              );

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${
                    isMe ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {!isMe && (
                    <img
                      src={msg.senderAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
                    />
                  )}

                  <div
                    className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${
                      isMe ? 'items-end' : 'items-start'
                    }`}
                  >
                    {!isMe && (
                      <span className="text-[11px] text-slate-500 font-medium mb-0.5">
                        {msg.senderName}
                      </span>
                    )}

                    <div
                      className={`relative rounded-lg p-2.5 shadow-xs text-xs leading-relaxed ${
                        isMe
                          ? 'bg-[#008b8b] text-white rounded-tr-none'
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                      }`}
                    >
                      {/* Scheduled message marker */}
                      {msg.isScheduled && (
                        <div className="mb-1.5 px-2 py-0.5 bg-black/20 rounded text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>예약 발송 ({msg.scheduledTime?.slice(11, 16)})</span>
                        </div>
                      )}

                      {/* Text */}
                      {msg.text && (
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      )}

                      {/* Photo Attachment inside bubble */}
                      {msg.media && msg.media.type === 'image' && (
                        <div
                          onClick={() => onOpenMedia(msg.media!)}
                          className="mt-1.5 rounded overflow-hidden cursor-pointer max-w-xs border border-white/20 hover:opacity-95"
                        >
                          <img
                            src={msg.media.url}
                            alt={msg.media.name}
                            className="w-full max-h-56 object-cover"
                          />
                        </div>
                      )}

                      {/* Video Player inside bubble */}
                      {msg.media && msg.media.type === 'video' && (
                        <div className="mt-1.5 rounded overflow-hidden bg-black max-w-xs">
                          <video
                            src={msg.media.url}
                            controls
                            className="w-full max-h-56 object-contain"
                          />
                        </div>
                      )}

                      {/* File attachment */}
                      {msg.media && msg.media.type === 'file' && (
                        <div
                          onClick={() => onOpenMedia(msg.media!)}
                          className={`mt-1.5 p-2 rounded flex items-center gap-2 cursor-pointer ${
                            isMe ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'
                          }`}
                        >
                          <Paperclip className="w-4 h-4" />
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold truncate">
                              {msg.media.name}
                            </div>
                            <div className="text-[9px] opacity-80">{msg.media.size}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata: Read receipt count & Timestamp */}
                    <div
                      className={`flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 ${
                        isMe ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <span>{msg.sentAt}</span>
                      {isMe && (
                        unreadCount > 0 ? (
                          <span className="text-[#008b8b] font-bold text-[10px]">
                            {unreadCount}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold text-[10px] flex items-center">
                            읽음
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Attached Media Staging Preview */}
          {attachedMedia && (
            <div className="px-4 py-2 bg-teal-50 border-t border-teal-200 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                {attachedMedia.type === 'image' && <ImageIcon className="w-4 h-4 text-blue-600" />}
                {attachedMedia.type === 'video' && <VideoIcon className="w-4 h-4 text-purple-600" />}
                <span className="font-semibold text-slate-800">{attachedMedia.name}</span>
                <span className="text-slate-400 text-[10px]">({attachedMedia.size})</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedMedia(null)}
                className="text-slate-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Scheduled Message Time Picker Drawer */}
          {showSchedulePicker && (
            <div className="px-4 py-2 bg-purple-50 border-t border-purple-200 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-purple-900">예약 전송 일시:</span>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="border border-purple-300 rounded px-2 py-0.5 text-xs bg-white text-slate-800"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowSchedulePicker(false)}
                className="text-purple-600 hover:text-purple-900 text-xs underline"
              >
                즉시 전송으로 변경
              </button>
            </div>
          )}

          {/* Message Input Bar */}
          <div className="p-3 bg-white border-t border-teal-200 flex flex-col gap-2">
            {/* Action Bar */}
            <div className="flex items-center justify-between text-slate-600">
              <div className="flex items-center gap-1.5">
                {/* Photo upload */}
                <label className="p-1.5 hover:bg-slate-100 rounded cursor-pointer text-slate-600 hover:text-[#008b8b] transition-colors" title="사진 전송">
                  <ImageIcon className="w-4 h-4" />
                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'image')}
                    className="hidden"
                  />
                </label>

                {/* Video upload */}
                <label className="p-1.5 hover:bg-slate-100 rounded cursor-pointer text-slate-600 hover:text-[#008b8b] transition-colors" title="동영상 전송">
                  <VideoIcon className="w-4 h-4" />
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, 'video')}
                    className="hidden"
                  />
                </label>

                {/* Sample media shortcuts */}
                <button
                  type="button"
                  onClick={() =>
                    setAttachedMedia({
                      id: `sample-img-${Date.now()}`,
                      name: '수업_활동사진.jpg',
                      size: '2.8 MB',
                      type: 'image',
                      url: SAMPLE_ACTIVITY_PHOTO,
                    })
                  }
                  className="px-2 py-0.5 text-[11px] bg-teal-50 hover:bg-teal-100 text-[#008b8b] rounded"
                >
                  + 사진 샘플
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAttachedMedia({
                      id: `sample-vid-${Date.now()}`,
                      name: '과학_실험영상.mp4',
                      size: '14.2 MB',
                      type: 'video',
                      url: SAMPLE_SCIENCE_VIDEO.url,
                      duration: '0:15',
                    })
                  }
                  className="px-2 py-0.5 text-[11px] bg-purple-50 hover:bg-purple-100 text-purple-700 rounded"
                >
                  + 동영상 샘플
                </button>

                {/* Message schedule toggle */}
                <button
                  type="button"
                  onClick={() => setShowSchedulePicker(!showSchedulePicker)}
                  className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs ${
                    showSchedulePicker
                      ? 'bg-purple-600 text-white font-bold'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                  title="메시지 예약 전송"
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-[11px]">예약 전송</span>
                </button>
              </div>

              <span className="text-[10px] text-slate-400">
                Enter: 전송 | Shift+Enter: 줄바꿈
              </span>
            </div>

            {/* Input textarea and Send Button */}
            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요..."
                className="flex-1 p-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-[#008b8b] resize-none text-slate-800"
              />
              <button
                type="button"
                onClick={handleSend}
                className="px-4 py-3 bg-[#008b8b] hover:bg-[#007373] text-white rounded font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>전송</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
          대화방을 선택하거나 새 그룹 대화방을 생성해 주세요.
        </div>
      )}

      {/* Create Group Chat Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-md rounded border-2 border-[#008b8b] shadow-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-sm text-[#008b8b] flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                그룹 채팅방 생성
              </span>
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Room Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                그룹 채팅방 이름
              </label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="예: 5학년 프로젝트 협력방, 교무실 비상연락"
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008b8b]"
              />
            </div>

            {/* Multi-recipient Checkbox Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                참여 교직원 선택 ({selectedParticipants.length}명 선택됨)
              </label>
              <div className="max-h-52 overflow-y-auto custom-scrollbar border rounded p-2 divide-y divide-slate-100 bg-slate-50">
                {allTeachers
                  .filter((t) => t.id !== currentUser.id)
                  .map((t) => {
                    const isChecked = selectedParticipants.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className="flex items-center gap-2 py-1.5 px-1 hover:bg-white rounded cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedParticipants((prev) =>
                              isChecked
                                ? prev.filter((id) => id !== t.id)
                                : [...prev, t.id]
                            );
                          }}
                          className="square-checkbox"
                        />
                        <span className="font-medium text-slate-800">{t.name}</span>
                        <span className="text-[11px] text-slate-500">
                          ({t.department} / {t.role})
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleCreateGroup}
                className="px-4 py-1.5 bg-[#008b8b] hover:bg-[#007373] text-white rounded text-xs font-bold transition-colors"
              >
                채팅방 생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
