/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { ProfileHeader } from './components/ProfileHeader';
import { Sidebar, NavTab } from './components/Sidebar';
import { OrgTree } from './components/OrgTree';
import { NotesView } from './components/NotesView';
import { FilesView } from './components/FilesView';
import { ChatView } from './components/ChatView';
import { NoticeBoardView } from './components/NoticeBoardView';
import { PollBoardView } from './components/PollBoardView';
import { NoteComposerModal } from './components/NoteComposerModal';
import { NoteViewerModal } from './components/NoteViewerModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginModal } from './components/LoginModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import { DesktopWindow } from './components/DesktopWindow';
import { ToastContainer, ToastMessage } from './components/Toast';
import { BrowserPopupContainer } from './components/BrowserPopupContainer';
import {
  BrowserPopupType,
  openBrowserPopup,
  getMessengerChannel,
} from './utils/browserPopup';

import { WindowInstance, WindowType } from './types/window';
import {
  TeacherUser,
  Note,
  ChatRoom,
  ChatMessage,
  Announcement,
  Poll,
  NotificationSettings,
  FileAttachment,
} from './types/messenger';
import {
  INITIAL_TEACHERS,
  INITIAL_NOTES,
  INITIAL_CHAT_ROOMS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_POLLS,
  DEFAULT_NOTIFICATION_SETTINGS,
} from './data/mockData';
import { playNotificationSound } from './utils/audio';

export default function App() {
  // Check if current browser window is opened as a standalone real native browser popup
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const browserPopupType = searchParams?.get('popup') as BrowserPopupType | null;
  const popupNoteId = searchParams?.get('noteId');
  const popupRoomId = searchParams?.get('roomId');
  const popupRecipients = searchParams?.get('recipients')?.split(',').filter(Boolean) || [];
  const popupReplyTitle = searchParams?.get('replyTitle');

  if (browserPopupType) {
    return (
      <BrowserPopupContainer
        popupType={browserPopupType}
        noteId={popupNoteId}
        roomId={popupRoomId}
        initialRecipients={popupRecipients}
        replyTitle={popupReplyTitle}
      />
    );
  }

  // Teachers state
  const [teachers, setTeachers] = useState<TeacherUser[]>(() => {
    const saved = localStorage.getItem('gwnd_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  // Current logged in user (Default: 5학년 1반 신유진)
  const [currentUser, setCurrentUser] = useState<TeacherUser>(() => {
    const saved = localStorage.getItem('gwnd_current_user');
    return saved ? JSON.parse(saved) : teachers[0];
  });

  // Selected teacher checkboxes in OrgTree (Square checkboxes)
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  // Notes state
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('gwnd_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  // Chat rooms & messages state
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(() => {
    const saved = localStorage.getItem('gwnd_chat_rooms');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_ROOMS;
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('gwnd_messages');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  const [activeRoomId, setActiveRoomId] = useState<string | null>(
    INITIAL_CHAT_ROOMS[0]?.id || null
  );

  // Announcements & Polls
  const [notices, setNotices] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('gwnd_notices');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [polls, setPolls] = useState<Poll[]>(() => {
    const saved = localStorage.getItem('gwnd_polls');
    return saved ? JSON.parse(saved) : INITIAL_POLLS;
  });

  // Settings
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('gwnd_settings');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATION_SETTINGS;
  });

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Main Messenger Window state (the contact list & directory window)
  const [isMainMinimized, setIsMainMinimized] = useState(false);
  const [isMainMaximized, setIsMainMaximized] = useState(false);
  const [mainPos, setMainPos] = useState({ x: 20, y: 16 });

  // Floating Desktop Windows State
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const nextZIndexRef = useRef(100);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('gwnd_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('gwnd_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('gwnd_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('gwnd_chat_rooms', JSON.stringify(chatRooms));
  }, [chatRooms]);

  useEffect(() => {
    localStorage.setItem('gwnd_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('gwnd_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('gwnd_polls', JSON.stringify(polls));
  }, [polls]);

  useEffect(() => {
    localStorage.setItem('gwnd_settings', JSON.stringify(settings));
  }, [settings]);

  // Listen for real browser popup window sync events
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
        const { type: eventType } = event.data || {};
        if (eventType === 'NOTE_SAVED') {
          const fresh = localStorage.getItem('gwnd_notes');
          if (fresh) {
            setNotes(JSON.parse(fresh));
          }
          if (settings.soundEnabled) playNotificationSound(settings.soundType);
          showToast('새 쪽지가 발송/등록되었습니다.', 'success');
        } else if (eventType === 'NOTE_READ') {
          const fresh = localStorage.getItem('gwnd_notes');
          if (fresh) {
            setNotes(JSON.parse(fresh));
          }
        }
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
  }, [settings]);

  // Window Manager: Open or Focus Window
  const openWindow = (
    type: WindowType,
    title: string,
    defaultSize: { width: number; height: number },
    data?: any,
    forceNew: boolean = false
  ) => {
    nextZIndexRef.current += 1;
    const currentZ = nextZIndexRef.current;

    setWindows((prev) => {
      // Determine unique ID for the window
      let windowId: string;
      if (forceNew) {
        if (data?.id) {
          windowId = `win-${type}-${data.id}`;
        } else {
          windowId = `win-${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }
      } else {
        windowId = `win-${type}`;
      }

      const existing = prev.find((w) => w.id === windowId);

      if (existing) {
        setActiveWindowId(existing.id);
        return prev.map((w) =>
          w.id === existing.id
            ? { ...w, isMinimized: false, zIndex: currentZ, data: data || w.data, title }
            : w
        );
      }

      // Compute cascading offset so each new popup window is staggered visibly
      const cascadeCount = prev.filter((w) => !w.isMinimized).length;
      const step = 32;
      const offset = (cascadeCount % 8) * step;

      const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;

      const baseCenterX = Math.max(20, Math.round((screenW - defaultSize.width) / 2));
      const baseCenterY = Math.max(30, Math.round((screenH - defaultSize.height) / 2));

      // Calculate cascaded coordinates within bounds
      let startX = baseCenterX + (offset - 48);
      let startY = baseCenterY + (offset - 48);

      if (startX + defaultSize.width > screenW - 20) {
        startX = Math.max(20, screenW - defaultSize.width - 20);
      }
      if (startX < 20) startX = 20;

      if (startY + defaultSize.height > screenH - 50) {
        startY = Math.max(30, screenH - defaultSize.height - 60);
      }
      if (startY < 30) startY = 30;

      const newWin: WindowInstance = {
        id: windowId,
        title,
        type,
        x: startX,
        y: startY,
        width: Math.min(defaultSize.width, screenW - 40),
        height: Math.min(defaultSize.height, screenH - 70),
        zIndex: currentZ,
        isMinimized: false,
        isMaximized: false,
        data,
      };

      setActiveWindowId(newWin.id);
      return [...prev, newWin];
    });
  };

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const toggleMaximizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  };

  const focusWindow = (id: string) => {
    nextZIndexRef.current += 1;
    setActiveWindowId(id);
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndexRef.current } : w
      )
    );
  };

  const updateWindowPosition = (id: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  };

  // Helper actions to open specific popup windows (Priority: Real Native Browser Popups)
  const openNoteComposeWindow = (recipientIds?: string[], replyFromTitle?: string) => {
    const targetRecipients = recipientIds || selectedTeacherIds;

    // 1. Try launching a real native OS/browser popup window first!
    const realWin = openBrowserPopup('note-compose', {
      recipientIds: targetRecipients,
      replyTitle: replyFromTitle,
    });

    if (realWin) {
      return;
    }

    // 2. Fallback: If blocked by browser popup blocker, open in-app desktop floating window
    const existingComposeCount = windows.filter((w) => w.type === 'note-compose').length;
    const windowTitle = existingComposeCount > 0 ? `쪽지 전송 (${existingComposeCount + 1})` : '쪽지 전송';
    const composeSessionId = `compose-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    openWindow(
      'note-compose',
      windowTitle,
      { width: 720, height: 600 },
      { id: composeSessionId, initialRecipients: targetRecipients, replyTitle: replyFromTitle },
      true
    );
  };

  const openNoteViewWindow = (note: Note) => {
    // Mark as read for current user
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    if (!note.readReceipts[currentUser.id]) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === note.id
            ? {
                ...n,
                readReceipts: {
                  ...n.readReceipts,
                  [currentUser.id]: nowStr,
                },
              }
            : n
        )
      );
    }

    // 1. Try launching a real native OS/browser popup window first!
    const realWin = openBrowserPopup('note-view', {
      noteId: note.id,
    });

    if (realWin) {
      return;
    }

    // 2. Fallback if browser blocked popup
    openWindow(
      'note-view',
      `쪽지 받기 - ${note.senderName} (${note.title.slice(0, 10)})`,
      { width: 680, height: 560 },
      { id: note.id, note },
      true
    );
  };

  const openChatWindow = (roomId?: string) => {
    const targetRoomId = roomId || activeRoomId || chatRooms[0]?.id;
    if (targetRoomId) {
      setActiveRoomId(targetRoomId);
      // Clear unread
      setChatRooms((prev) =>
        prev.map((r) => (r.id === targetRoomId ? { ...r, unreadCount: 0 } : r))
      );
    }
    openWindow('chat', '실시간 대화', { width: 780, height: 600 }, { roomId: targetRoomId });
  };

  const openReceivedNotesWindow = () => {
    // 1. Try launching a real native browser popup with the received notes screen!
    const realWin = openBrowserPopup('received-notes', { width: 880, height: 680 });
    if (realWin) return;

    // 2. Fallback in-app window
    openWindow('notes-list-received', '홈 > 받은 쪽지', { width: 880, height: 680 }, undefined, true);
  };

  const openSentNotesWindow = () => {
    // 1. Try launching a real native browser popup with the sent notes screen!
    const realWin = openBrowserPopup('sent-notes', { width: 880, height: 680 });
    if (realWin) return;

    // 2. Fallback in-app window
    openWindow('notes-list-sent', '홈 > 보낸 쪽지', { width: 880, height: 680 }, undefined, true);
  };

  const openReceivedFilesWindow = () => {
    openWindow('files-list-received', '홈 > 받은 파일', { width: 800, height: 600 });
  };

  const openSentFilesWindow = () => {
    openWindow('files-list-sent', '홈 > 보낸 파일', { width: 800, height: 600 });
  };

  const openNoticesWindow = () => {
    openWindow('notices', '홈 > 공지', { width: 780, height: 580 });
  };

  const openPollsWindow = () => {
    openWindow('polls', '홈 > 투표', { width: 740, height: 580 });
  };

  const openProfileWindow = () => {
    openWindow('profile', '사용자 프로필 관리', { width: 490, height: 540 });
  };

  const openSettingsWindow = () => {
    openWindow('settings', '알림 및 환경 설정', { width: 500, height: 560 });
  };

  const openLoginWindow = () => {
    openWindow('login', '교직원 로그인 및 계정 전환', { width: 520, height: 560 });
  };

  const openMediaWindow = (att: FileAttachment) => {
    openWindow('media', `미디어 뷰어 - ${att.name}`, { width: 760, height: 600 }, { media: att }, true);
  };

  // Scheduled message processor (checks every 6 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

      // Check scheduled notes
      setNotes((prevNotes) =>
        prevNotes.map((note) => {
          if (note.isScheduled && note.scheduledTime && note.scheduledTime <= nowStr) {
            // Deliver scheduled note!
            if (settings.soundEnabled) playNotificationSound(settings.soundType);
            const delivered = {
              ...note,
              isScheduled: false,
              sentAt: nowStr,
            };
            // Automatically pop up the note on arrival!
            openNoteViewWindow(delivered);
            return delivered;
          }
          return note;
        })
      );
    }, 6000);

    return () => clearInterval(timer);
  }, [settings, currentUser.id]);

  // Derived notes lists
  const receivedNotes = notes.filter(
    (n) => n.recipientIds.includes(currentUser.id) && !n.isDraft && !n.isScheduled
  );
  const sentNotes = notes.filter((n) => n.senderId === currentUser.id);

  const unreadNotesCount = receivedNotes.filter(
    (n) => !n.readReceipts[currentUser.id]
  ).length;

  const totalUnreadChats = chatRooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);

  // Checkbox handlers in OrgTree
  const handleToggleTeacher = (tId: string) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(tId) ? prev.filter((id) => id !== tId) : [...prev, tId]
    );
  };

  const handleSelectMultipleTeachers = (tIds: string[]) => {
    setSelectedTeacherIds(tIds);
  };

  const handleClearSelection = () => {
    setSelectedTeacherIds([]);
  };

  // Send Note action
  const handleSendNote = (
    data: {
      recipientIds: string[];
      title: string;
      content: string;
      attachments: FileAttachment[];
      isScheduled: boolean;
      scheduledTime?: string;
    },
    windowId?: string
  ) => {
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

    setNotes((prev) => [newNote, ...prev]);

    if (!data.isScheduled && settings.soundEnabled) {
      playNotificationSound(settings.soundType);
    }

    // Clear selections and close the specific compose window
    setSelectedTeacherIds([]);
    if (windowId) {
      closeWindow(windowId);
    } else {
      closeWindow('win-note-compose');
    }

    showToast(
      data.isScheduled
        ? `예약 쪽지가 등록되었습니다. (${data.scheduledTime} 발송 예정)`
        : `${recipientNames.length}명에게 쪽지를 전송하였습니다.`
    );
  };

  const handleSaveDraftNote = (
    data: {
      recipientIds: string[];
      title: string;
      content: string;
      attachments: FileAttachment[];
    },
    windowId?: string
  ) => {
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
    setNotes((prev) => [draftNote, ...prev]);
    if (windowId) {
      closeWindow(windowId);
    } else {
      closeWindow('win-note-compose');
    }
    showToast('임시 저장이 완료되었습니다.', 'info');
  };

  // Send scheduled note now
  const handleSendScheduledNow = (noteId: string) => {
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? {
              ...n,
              isScheduled: false,
              sentAt: nowStr,
            }
          : n
      )
    );
    showToast('예약 쪽지가 즉시 발송되었습니다.');
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    showToast('쪽지가 삭제되었습니다.', 'info');
  };

  // Chat handlers
  const handleStartGroupChat = (targetIds: string[]) => {
    const participants = Array.from(new Set([currentUser.id, ...targetIds]));
    const names = participants
      .map((id) => teachers.find((t) => t.id === id)?.name || id)
      .slice(0, 3)
      .join(', ');
    const newRoom: ChatRoom = {
      id: `room-group-${Date.now()}`,
      name: `${names} 외 (${participants.length}명)`,
      type: 'group',
      participantIds: participants,
      unreadCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setChatRooms((prev) => [newRoom, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newRoom.id]: [],
    }));
    setActiveRoomId(newRoom.id);
    setSelectedTeacherIds([]);
    openChatWindow(newRoom.id);
  };

  const handleStartDirectChat = (teacherId: string) => {
    const existing = chatRooms.find(
      (r) =>
        r.type === 'direct' &&
        r.participantIds.includes(currentUser.id) &&
        r.participantIds.includes(teacherId)
    );
    if (existing) {
      setActiveRoomId(existing.id);
      openChatWindow(existing.id);
      return;
    }

    const otherTeacher = teachers.find((t) => t.id === teacherId);
    const newRoom: ChatRoom = {
      id: `room-direct-${Date.now()}`,
      name: otherTeacher ? `${otherTeacher.name} (${otherTeacher.role})` : '1:1 대화',
      type: 'direct',
      participantIds: [currentUser.id, teacherId],
      unreadCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setChatRooms((prev) => [newRoom, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newRoom.id]: [],
    }));
    setActiveRoomId(newRoom.id);
    openChatWindow(newRoom.id);
  };

  const handleCreateGroupRoom = (roomName: string, participantIds: string[]) => {
    const newRoom: ChatRoom = {
      id: `room-group-${Date.now()}`,
      name: `${roomName} (${participantIds.length}명)`,
      type: 'group',
      participantIds,
      unreadCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setChatRooms((prev) => [newRoom, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newRoom.id]: [],
    }));
    setActiveRoomId(newRoom.id);
    openChatWindow(newRoom.id);
  };

  const handleSendMessage = (
    roomId: string,
    text: string,
    media?: FileAttachment,
    isScheduled?: boolean,
    scheduledTime?: string
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text,
      media,
      sentAt: isScheduled ? scheduledTime?.slice(11, 16) || timeStr : timeStr,
      readBy: [currentUser.id],
      isScheduled,
      scheduledTime,
    };

    // Update room messages
    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMsg],
    }));

    // Update room preview
    setChatRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              lastMessage: media
                ? `[${media.type === 'image' ? '사진' : media.type === 'video' ? '동영상' : '파일'}] ${
                    text || media.name
                  }`
                : text,
              lastMessageAt: timeStr,
            }
          : r
      )
    );

    if (settings.soundEnabled) {
      playNotificationSound(settings.soundType);
    }

    // Simulate smart interactive reply from colleague in 1.6s
    const targetRoom = chatRooms.find((r) => r.id === roomId);
    if (targetRoom && !isScheduled) {
      const otherTeacherId = targetRoom.participantIds.find((id) => id !== currentUser.id);
      const otherTeacher = teachers.find((t) => t.id === otherTeacherId);

      if (otherTeacher) {
        setTimeout(() => {
          const replies = [
            '네 선생님! 쪽지와 메시지 확인했습니다.',
            '공유해 주신 자료 감사합니다. 검토 후 연락드릴게요.',
            '좋은 의견이네요! 이번 학기 수업에 바로 적용해 보겠습니다.',
            '확인 완료했습니다. 오늘도 수고 많으셨습니다 😊',
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];

          const replyMsg: ChatMessage = {
            id: `msg-reply-${Date.now()}`,
            roomId,
            senderId: otherTeacher.id,
            senderName: otherTeacher.name,
            senderAvatar: otherTeacher.avatar,
            text: randomReply,
            sentAt: new Date().toTimeString().slice(0, 5),
            readBy: [otherTeacher.id],
          };

          setMessages((prev) => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), replyMsg],
          }));

          setChatRooms((prev) =>
            prev.map((r) =>
              r.id === roomId
                ? {
                    ...r,
                    lastMessage: randomReply,
                    lastMessageAt: replyMsg.sentAt,
                  }
                : r
            )
          );

          if (settings.soundEnabled) playNotificationSound(settings.soundType);
        }, 1600);
      }
    }
  };

  // Announcement & Poll handlers
  const handleAddNotice = (noticeData: Omit<Announcement, 'id' | 'views'>) => {
    const newNotice: Announcement = {
      ...noticeData,
      id: `ann-${Date.now()}`,
      views: 1,
    };
    setNotices((prev) => [newNotice, ...prev]);
    showToast('공지사항이 등록되었습니다.');
  };

  const handleCastVote = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p;
        if (p.votedUserIds.includes(currentUser.id)) return p;

        const updatedOptions = p.options.map((opt) =>
          opt.id === optionId
            ? {
                ...opt,
                votes: opt.votes + 1,
                voters: [...opt.voters, currentUser.id],
              }
            : opt
        );

        return {
          ...p,
          options: updatedOptions,
          votedUserIds: [...p.votedUserIds, currentUser.id],
          totalVotes: p.totalVotes + 1,
        };
      })
    );
    showToast('투표 참여가 완료되었습니다.');
  };

  const handleCreatePoll = (pollData: {
    title: string;
    description: string;
    options: string[];
  }) => {
    const newPoll: Poll = {
      id: `poll-${Date.now()}`,
      title: pollData.title,
      author: `${currentUser.name} (${currentUser.role})`,
      department: currentUser.department,
      views: 1,
      date: new Date().toISOString().slice(0, 10),
      description: pollData.description,
      options: pollData.options.map((opt, i) => ({
        id: `opt-${Date.now()}-${i}`,
        text: opt,
        votes: 0,
        voters: [],
      })),
      votedUserIds: [],
      totalVotes: 0,
    };
    setPolls((prev) => [newPoll, ...prev]);
    showToast('새 투표가 등록되었습니다.');
  };

  // Profile update
  const handleUpdateBio = (newName: string, newBio: string) => {
    const updated = {
      ...currentUser,
      name: newName,
      statusMessage: newBio,
      bio: newBio,
    };
    setCurrentUser(updated);
    setTeachers((prev) => prev.map((t) => (t.id === currentUser.id ? updated : t)));
    showToast('이름 및 상태메시지가 업데이트되었습니다.', 'info');
  };

  const handleSaveFullProfile = (updated: Partial<TeacherUser>) => {
    const merged = { ...currentUser, ...updated };
    setCurrentUser(merged);
    setTeachers((prev) => prev.map((t) => (t.id === currentUser.id ? merged : t)));
    closeWindow('win-profile');
    showToast('프로필이 성공적으로 저장되었습니다.');
  };

  // User Switcher / Login
  const handleSelectUser = (user: TeacherUser) => {
    setCurrentUser(user);
    closeWindow('win-login');
    showToast(`${user.name} (${user.role}) 계정으로 전환되었습니다.`);
  };

  // Main active tab for full-screen messenger home
  const [activeTab, setActiveTab] = useState<NavTab>('org');

  // Sidebar navigation click router (keeps main screen unchanged when popping up notes)
  const handleNavClick = (tab: NavTab) => {
    if (tab === 'received-notes') {
      openReceivedNotesWindow();
      return;
    }
    if (tab === 'sent-notes') {
      openSentNotesWindow();
      return;
    }
    setActiveTab(tab);
    if (tab === 'chat' && activeRoomId) {
      setChatRooms((prev) =>
        prev.map((r) => (r.id === activeRoomId ? { ...r, unreadCount: 0 } : r))
      );
    }
  };

  return (
    <div
      className={`h-screen w-screen bg-[#c2e2e1] overflow-hidden select-none flex flex-col relative ${
        settings.fontSize === 'large'
          ? 'text-[15px]'
          : settings.fontSize === 'huge'
          ? 'text-[17px]'
          : 'text-[13px]'
      }`}
    >
      {/* Full-Screen Messenger Window Frame */}
      <div className="w-full h-full bg-white flex flex-col overflow-hidden shadow-none">
        {/* Top Header Bar spanning full screen */}
        <HeaderBar
          title="경원남도 메신저"
          isMaximized={true}
          onMaximize={() => {}}
          onMinimize={() => {}}
          onClose={() => openLoginWindow()}
        />

        {/* Profile Header Banner matching Screenshot 2 */}
        <ProfileHeader
          currentUser={currentUser}
          onUpdateBio={handleUpdateBio}
          onOpenProfile={openProfileWindow}
          onOpenLogin={openLoginWindow}
          onOpenCompose={() => openNoteComposeWindow()}
        />

        {/* Full-screen Body: Sidebar + Active Central View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Vertical Teal Strip with Navigation icons */}
          <Sidebar
            currentUser={currentUser}
            activeTab={activeTab}
            onTabChange={handleNavClick}
            onOpenCompose={() => openNoteComposeWindow()}
            onOpenProfile={openProfileWindow}
            onOpenSettings={openSettingsWindow}
            onLogout={openLoginWindow}
            unreadNotesCount={unreadNotesCount}
            unreadChatsCount={totalUnreadChats}
          />

          {/* Center Main View filling full screen */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {activeTab === 'org' && (
              <OrgTree
                teachers={teachers}
                selectedTeacherIds={selectedTeacherIds}
                onToggleTeacher={handleToggleTeacher}
                onSelectMultiple={handleSelectMultipleTeachers}
                onClearSelection={handleClearSelection}
                onComposeNote={(targetIds) => openNoteComposeWindow(targetIds)}
                onStartGroupChat={handleStartGroupChat}
                onStartDirectChat={handleStartDirectChat}
                currentUserId={currentUser.id}
              />
            )}

            {activeTab === 'received-notes' && (
              <NotesView
                type="received"
                notes={receivedNotes}
                currentUserId={currentUser.id}
                allTeachers={teachers}
                onOpenCompose={(ids) => openNoteComposeWindow(ids)}
                onOpenMedia={openMediaWindow}
                onDeleteNote={handleDeleteNote}
                onSendScheduledNow={handleSendScheduledNow}
                onOpenNotePopup={openNoteViewWindow}
              />
            )}

            {activeTab === 'sent-notes' && (
              <NotesView
                type="sent"
                notes={sentNotes}
                currentUserId={currentUser.id}
                allTeachers={teachers}
                onOpenCompose={(ids) => openNoteComposeWindow(ids)}
                onOpenMedia={openMediaWindow}
                onDeleteNote={handleDeleteNote}
                onSendScheduledNow={handleSendScheduledNow}
                onOpenNotePopup={openNoteViewWindow}
              />
            )}

            {activeTab === 'received-files' && (
              <FilesView
                type="received"
                notes={receivedNotes}
                onOpenMedia={openMediaWindow}
              />
            )}

            {activeTab === 'sent-files' && (
              <FilesView
                type="sent"
                notes={sentNotes}
                onOpenMedia={openMediaWindow}
              />
            )}

            {activeTab === 'chat' && (
              <ChatView
                currentRoomId={activeRoomId}
                onSelectRoom={(roomId) => {
                  setActiveRoomId(roomId);
                  setChatRooms((prev) =>
                    prev.map((r) => (r.id === roomId ? { ...r, unreadCount: 0 } : r))
                  );
                }}
                chatRooms={chatRooms}
                messages={messages}
                currentUser={currentUser}
                allTeachers={teachers}
                onSendMessage={handleSendMessage}
                onCreateGroupRoom={handleCreateGroupRoom}
                onOpenMedia={openMediaWindow}
              />
            )}

            {activeTab === 'notices' && (
              <NoticeBoardView
                notices={notices}
                onOpenMedia={openMediaWindow}
                onAddNotice={handleAddNotice}
                currentUserName={`${currentUser.name} (${currentUser.role})`}
              />
            )}

            {activeTab === 'polls' && (
              <PollBoardView
                polls={polls}
                currentUser={currentUser}
                onCastVote={handleCastVote}
                onCreatePoll={handleCreatePoll}
              />
            )}
          </div>
        </div>
      </div>

      {/* Render all open floating popup windows! */}
      {windows.map((win) => (
        <DesktopWindow
          key={win.id}
          window={win}
          onFocus={focusWindow}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onToggleMaximize={toggleMaximizeWindow}
          onUpdatePosition={updateWindowPosition}
          onPopOutToBrowser={(win) => {
            if (win.type === 'note-compose') {
              closeWindow(win.id);
              openBrowserPopup('note-compose', {
                recipientIds: win.data?.initialRecipients,
                replyTitle: win.data?.replyTitle,
              });
            } else if (win.type === 'note-view' && win.data?.note) {
              closeWindow(win.id);
              openBrowserPopup('note-view', {
                noteId: win.data.note.id,
              });
            } else if (win.type === 'notes-list-received') {
              closeWindow(win.id);
              openBrowserPopup('received-notes');
            } else if (win.type === 'notes-list-sent') {
              closeWindow(win.id);
              openBrowserPopup('sent-notes');
            } else if (win.type === 'chat') {
              closeWindow(win.id);
              openBrowserPopup('chat', { roomId: win.data?.roomId });
            }
          }}
          onOpenAnotherWindow={(winType) => {
            if (winType === 'note-compose') {
              openNoteComposeWindow();
            } else if (winType === 'note-view') {
              openNoteComposeWindow();
            } else {
              openWindow(winType, `${win.title} (추가 창)`, { width: win.width, height: win.height }, undefined, true);
            }
          }}
        >
          {win.type === 'note-compose' && (
            <NoteComposerModal
              isOpen={true}
              isPopup={true}
              onClose={() => closeWindow(win.id)}
              onSend={(data) => handleSendNote(data, win.id)}
              onSaveDraft={(data) => handleSaveDraftNote(data, win.id)}
              allTeachers={teachers}
              initialRecipientIds={win.data?.initialRecipients || []}
              replyToNoteTitle={win.data?.replyTitle}
              onOpenAnotherCompose={() => openNoteComposeWindow()}
            />
          )}

          {win.type === 'note-view' && win.data?.note && (
            <NoteViewerModal
              isOpen={true}
              isPopup={true}
              note={win.data.note}
              onClose={() => closeWindow(win.id)}
              onReply={(note) => {
                openNoteComposeWindow([note.senderId], note.title);
              }}
              onOpenNewCompose={() => openNoteComposeWindow()}
              allTeachers={teachers}
              onOpenMedia={openMediaWindow}
            />
          )}

          {win.type === 'notes-list-received' && (
            <NotesView
              type="received"
              notes={receivedNotes}
              currentUserId={currentUser.id}
              allTeachers={teachers}
              onOpenCompose={(ids) => openNoteComposeWindow(ids)}
              onOpenMedia={openMediaWindow}
              onDeleteNote={handleDeleteNote}
              onSendScheduledNow={handleSendScheduledNow}
              onOpenNotePopup={openNoteViewWindow}
            />
          )}

          {win.type === 'notes-list-sent' && (
            <NotesView
              type="sent"
              notes={sentNotes}
              currentUserId={currentUser.id}
              allTeachers={teachers}
              onOpenCompose={(ids) => openNoteComposeWindow(ids)}
              onOpenMedia={openMediaWindow}
              onDeleteNote={handleDeleteNote}
              onSendScheduledNow={handleSendScheduledNow}
              onOpenNotePopup={openNoteViewWindow}
            />
          )}

          {win.type === 'files-list-received' && (
            <FilesView
              type="received"
              notes={receivedNotes}
              onOpenMedia={openMediaWindow}
            />
          )}

          {win.type === 'files-list-sent' && (
            <FilesView
              type="sent"
              notes={sentNotes}
              onOpenMedia={openMediaWindow}
            />
          )}

          {win.type === 'chat' && (
            <ChatView
              currentRoomId={activeRoomId}
              onSelectRoom={(roomId) => {
                setActiveRoomId(roomId);
                setChatRooms((prev) =>
                  prev.map((r) => (r.id === roomId ? { ...r, unreadCount: 0 } : r))
                );
              }}
              chatRooms={chatRooms}
              messages={messages}
              currentUser={currentUser}
              allTeachers={teachers}
              onSendMessage={handleSendMessage}
              onCreateGroupRoom={handleCreateGroupRoom}
              onOpenMedia={openMediaWindow}
            />
          )}

          {win.type === 'notices' && (
            <NoticeBoardView
              notices={notices}
              onOpenMedia={openMediaWindow}
              onAddNotice={handleAddNotice}
              currentUserName={`${currentUser.name} (${currentUser.role})`}
            />
          )}

          {win.type === 'polls' && (
            <PollBoardView
              polls={polls}
              currentUser={currentUser}
              onCastVote={handleCastVote}
              onCreatePoll={handleCreatePoll}
            />
          )}

          {win.type === 'profile' && (
            <ProfileEditModal
              isOpen={true}
              isPopup={true}
              currentUser={currentUser}
              onClose={() => closeWindow(win.id)}
              onSaveProfile={handleSaveFullProfile}
            />
          )}

          {win.type === 'settings' && (
            <SettingsModal
              isOpen={true}
              isPopup={true}
              settings={settings}
              onClose={() => closeWindow(win.id)}
              onUpdateSettings={(updated) => setSettings((s) => ({ ...s, ...updated }))}
            />
          )}

          {win.type === 'login' && (
            <LoginModal
              isOpen={true}
              isPopup={true}
              currentUser={currentUser}
              allTeachers={teachers}
              onSelectUser={handleSelectUser}
              onClose={() => closeWindow(win.id)}
            />
          )}

          {win.type === 'media' && win.data?.media && (
            <div className="flex-1 flex flex-col h-full bg-slate-900 p-2">
              <MediaViewerModal
                isOpen={true}
                media={win.data.media}
                onClose={() => closeWindow(win.id)}
              />
            </div>
          )}
        </DesktopWindow>
      ))}

      {/* Floating in-app Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
