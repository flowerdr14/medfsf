/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, X, ExternalLink, RefreshCw } from 'lucide-react';
import { NoteComposerModal } from './NoteComposerModal';
import { NoteViewerModal } from './NoteViewerModal';
import { NotesView } from './NotesView';
import { ChatView } from './ChatView';
import { NoticeBoardView } from './NoticeBoardView';
import { PollBoardView } from './PollBoardView';
import {
  TeacherUser,
  Note,
  ChatRoom,
  ChatMessage,
  Announcement,
  Poll,
  FileAttachment,
} from '../types/messenger';
import {
  INITIAL_TEACHERS,
  INITIAL_NOTES,
  INITIAL_CHAT_ROOMS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_POLLS,
} from '../data/mockData';
import {
  BrowserPopupType,
  openBrowserPopup,
  getMessengerChannel,
} from '../utils/browserPopup';

interface BrowserPopupContainerProps {
  popupType: BrowserPopupType;
  noteId?: string | null;
  roomId?: string | null;
  initialRecipients?: string[];
  replyTitle?: string | null;
}

export const BrowserPopupContainer: React.FC<BrowserPopupContainerProps> = ({
  popupType,
  noteId,
  roomId,
  initialRecipients = [],
  replyTitle,
}) => {
  // Load state from localStorage
  const [teachers] = useState<TeacherUser[]>(() => {
    const saved = localStorage.getItem('gwnd_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [currentUser] = useState<TeacherUser>(() => {
    const saved = localStorage.getItem('gwnd_current_user');
    return saved ? JSON.parse(saved) : teachers[0];
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('gwnd_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(() => {
    const saved = localStorage.getItem('gwnd_chat_rooms');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_ROOMS;
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('gwnd_messages');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  const [notices, setNotices] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('gwnd_notices');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [polls, setPolls] = useState<Poll[]>(() => {
    const saved = localStorage.getItem('gwnd_polls');
    return saved ? JSON.parse(saved) : INITIAL_POLLS;
  });

  // Target Note if viewing
  const activeNote = notes.find((n) => n.id === noteId) || null;

  // Real-time synchronization with other windows
  useEffect(() => {
    const channel = getMessengerChannel();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'gwnd_notes' && e.newValue) {
        setNotes(JSON.parse(e.newValue));
      }
      if (e.key === 'gwnd_chat_rooms' && e.newValue) {
        setChatRooms(JSON.parse(e.newValue));
      }
      if (e.key === 'gwnd_messages' && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorage);

    if (channel) {
      channel.onmessage = (event) => {
        const { type: eventType, payload } = event.data || {};
        if (eventType === 'NOTE_SAVED' || eventType === 'NOTE_READ') {
          const fresh = localStorage.getItem('gwnd_notes');
          if (fresh) setNotes(JSON.parse(fresh));
        } else if (eventType === 'CHAT_SENT') {
          const freshMessages = localStorage.getItem('gwnd_messages');
          if (freshMessages) setMessages(JSON.parse(freshMessages));
        }
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
  }, []);

  // Set document title in the real browser window
  useEffect(() => {
    const titleMap: Record<BrowserPopupType, string> = {
      'note-compose': '경원남도 메신저 - 쪽지 전송 (브라우저 팝업)',
      'note-view': activeNote
        ? `경원남도 메신저 - 쪽지 받기: ${activeNote.senderName} (${activeNote.title})`
        : '경원남도 메신저 - 쪽지 받기',
      'chat': '경원남도 메신저 - 실시간 대화',
      'received-notes': '경원남도 메신저 - 받은 쪽지',
      'sent-notes': '경원남도 메신저 - 보낸 쪽지',
      'notices': '경원남도 메신저 - 공지사항',
      'polls': '경원남도 메신저 - 설문/투표',
    };
    document.title = titleMap[popupType] || '경원남도 메신저';
  }, [popupType, activeNote]);

  // Mark read receipt when viewing a note
  useEffect(() => {
    if (popupType === 'note-view' && activeNote && !activeNote.readReceipts[currentUser.id]) {
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const updatedNotes = notes.map((n) =>
        n.id === activeNote.id
          ? {
              ...n,
              readReceipts: {
                ...n.readReceipts,
                [currentUser.id]: nowStr,
              },
            }
          : n
      );
      setNotes(updatedNotes);
      localStorage.setItem('gwnd_notes', JSON.stringify(updatedNotes));

      const channel = getMessengerChannel();
      if (channel) {
        channel.postMessage({ type: 'NOTE_READ', payload: { noteId: activeNote.id, userId: currentUser.id } });
        channel.close();
      }
    }
  }, [popupType, activeNote, currentUser.id]);

  // Actions
  const handleSendNote = (data: {
    recipientIds: string[];
    title: string;
    content: string;
    attachments: FileAttachment[];
    isScheduled: boolean;
    scheduledTime?: string;
  }) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    const recipientTeacherObjects = teachers.filter((t) =>
      data.recipientIds.includes(t.id)
    );
    const recipientNames = recipientTeacherObjects.map((t) => `${t.name} (${t.role})`);

    const newNote: Note = {
      id: `note-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientIds: data.recipientIds,
      recipientNames,
      title: data.title,
      content: data.content,
      attachments: data.attachments,
      sentAt: data.isScheduled ? data.scheduledTime || timeStr : timeStr,
      isScheduled: data.isScheduled,
      scheduledTime: data.scheduledTime,
      readReceipts: {},
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem('gwnd_notes', JSON.stringify(updated));

    const channel = getMessengerChannel();
    if (channel) {
      channel.postMessage({ type: 'NOTE_SAVED', payload: newNote });
      channel.close();
    }

    // Close real browser popup window
    window.close();
  };

  const handleSaveDraftNote = (data: {
    recipientIds: string[];
    title: string;
    content: string;
    attachments: FileAttachment[];
  }) => {
    const draftNote: Note = {
      id: `draft-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientIds: data.recipientIds,
      recipientNames: data.recipientIds.map((id) => {
        const t = teachers.find((tch) => tch.id === id);
        return t ? `${t.name} (${t.role})` : id;
      }),
      title: data.title,
      content: data.content,
      attachments: data.attachments,
      sentAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      readReceipts: {},
      isDraft: true,
    };

    const updated = [draftNote, ...notes];
    setNotes(updated);
    localStorage.setItem('gwnd_notes', JSON.stringify(updated));

    const channel = getMessengerChannel();
    if (channel) {
      channel.postMessage({ type: 'NOTE_SAVED', payload: draftNote });
      channel.close();
    }

    window.close();
  };

  const handleOpenAnotherCompose = () => {
    openBrowserPopup('note-compose');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden select-none font-sans">
      {/* Real Browser Popup Top Bar matching Messenger styling */}
      <div className="h-10 bg-[#008b8b] text-white px-3 flex items-center justify-between shadow-xs shrink-0 select-none border-b border-[#007373]">
        <div className="flex items-center gap-2">
          {/* Logo icon */}
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008b8b]" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-tight">
            {popupType === 'note-compose' && '경원남도 메신저 - 쪽지 전송'}
            {popupType === 'note-view' && '경원남도 메신저 - 쪽지 받기'}
            {popupType === 'chat' && '경원남도 메신저 - 실시간 대화'}
            {popupType === 'received-notes' && '경원남도 메신저 - 받은 쪽지함'}
            {popupType === 'sent-notes' && '경원남도 메신저 - 보낸 쪽지함'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Button to open another popup window */}
          <button
            type="button"
            onClick={handleOpenAnotherCompose}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
            title="새 쪽지 작성 창 띄우기"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>쪽지 쓰기</span>
          </button>

          {/* Close browser window */}
          <button
            type="button"
            onClick={() => window.close()}
            className="p-1 hover:bg-red-500 hover:text-white text-teal-100 rounded transition-colors"
            title="이 브라우저 창 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content View in Popup */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {popupType === 'note-compose' && (
          <NoteComposerModal
            isOpen={true}
            isPopup={true}
            onClose={() => window.close()}
            onSend={handleSendNote}
            onSaveDraft={handleSaveDraftNote}
            allTeachers={teachers}
            initialRecipientIds={initialRecipients}
            replyToNoteTitle={replyTitle || undefined}
            onOpenAnotherCompose={handleOpenAnotherCompose}
          />
        )}

        {popupType === 'note-view' && activeNote && (
          <NoteViewerModal
            isOpen={true}
            isPopup={true}
            note={activeNote}
            onClose={() => window.close()}
            onReply={(note) => {
              openBrowserPopup('note-compose', {
                recipientIds: [note.senderId],
                replyTitle: note.title,
              });
            }}
            onOpenNewCompose={handleOpenAnotherCompose}
            allTeachers={teachers}
            onOpenMedia={(att) => {
              if (att.url) window.open(att.url, '_blank');
            }}
          />
        )}

        {popupType === 'note-view' && !activeNote && (
          <NotesView
            type="received"
            notes={notes.filter((n) => n.recipientIds.includes(currentUser.id) && !n.isDraft && !n.isScheduled)}
            currentUserId={currentUser.id}
            allTeachers={teachers}
            onOpenCompose={(ids) => openBrowserPopup('note-compose', { recipientIds: ids })}
            onOpenMedia={(att) => {
              if (att.url) window.open(att.url, '_blank');
            }}
            onDeleteNote={(noteId) => {
              const updated = notes.filter((n) => n.id !== noteId);
              setNotes(updated);
              localStorage.setItem('gwnd_notes', JSON.stringify(updated));
            }}
            onSendScheduledNow={() => {}}
            onOpenNotePopup={(note) => {
              openBrowserPopup('note-view', { noteId: note.id });
            }}
          />
        )}

        {popupType === 'received-notes' && (
          <NotesView
            type="received"
            notes={notes.filter((n) => n.recipientIds.includes(currentUser.id) && !n.isDraft && !n.isScheduled)}
            currentUserId={currentUser.id}
            allTeachers={teachers}
            onOpenCompose={(ids) => openBrowserPopup('note-compose', { recipientIds: ids })}
            onOpenMedia={(att) => {
              if (att.url) window.open(att.url, '_blank');
            }}
            onDeleteNote={(noteId) => {
              const updated = notes.filter((n) => n.id !== noteId);
              setNotes(updated);
              localStorage.setItem('gwnd_notes', JSON.stringify(updated));
            }}
            onSendScheduledNow={() => {}}
            onOpenNotePopup={(note) => {
              openBrowserPopup('note-view', { noteId: note.id });
            }}
          />
        )}

        {popupType === 'sent-notes' && (
          <NotesView
            type="sent"
            notes={notes.filter((n) => n.senderId === currentUser.id)}
            currentUserId={currentUser.id}
            allTeachers={teachers}
            onOpenCompose={(ids) => openBrowserPopup('note-compose', { recipientIds: ids })}
            onOpenMedia={(att) => {
              if (att.url) window.open(att.url, '_blank');
            }}
            onDeleteNote={(noteId) => {
              const updated = notes.filter((n) => n.id !== noteId);
              setNotes(updated);
              localStorage.setItem('gwnd_notes', JSON.stringify(updated));
            }}
            onSendScheduledNow={() => {}}
            onOpenNotePopup={(note) => {
              openBrowserPopup('note-view', { noteId: note.id });
            }}
          />
        )}
      </div>
    </div>
  );
};
