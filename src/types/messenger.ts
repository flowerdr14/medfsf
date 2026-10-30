export type UserStatus = 'online' | 'class' | 'meeting' | 'away' | 'offline';

export interface TeacherUser {
  id: string;
  name: string;
  role: string; // e.g. "5학년 1반 담임", "교장", "보건 교사"
  department: string; // e.g. "5학년", "교무실", "기타", "도움반"
  email: string;
  phone: string;
  bio: string;
  avatar: string;
  status: UserStatus;
  statusMessage?: string;
}

export interface OrgNode {
  id: string;
  name: string;
  type: 'office' | 'school' | 'dept' | 'grade' | 'class' | 'teacher';
  teacherId?: string;
  children?: OrgNode[];
}

export interface FileAttachment {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'video' | 'file';
  url: string;
  thumbnailUrl?: string;
  duration?: string;
}

export interface Note {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientIds: string[];
  recipientNames: string[];
  title: string;
  content: string;
  attachments: FileAttachment[];
  sentAt: string; // ISO date string
  isScheduled?: boolean;
  scheduledTime?: string;
  readReceipts: Record<string, string>; // userId -> timestamp when read
  isDraft?: boolean;
  isImportant?: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  media?: FileAttachment;
  sentAt: string;
  readBy: string[]; // user IDs who have read this message
  isScheduled?: boolean;
  scheduledTime?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participantIds: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  author: string;
  department: string;
  views: number;
  date: string;
  content: string;
  attachments?: FileAttachment[];
  isPinned?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[]; // user IDs
}

export interface Poll {
  id: string;
  title: string;
  author: string;
  department: string;
  views: number;
  date: string;
  description: string;
  options: PollOption[];
  votedUserIds: string[];
  totalVotes: number;
  closed?: boolean;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  soundType: 'chime1' | 'chime2' | 'bell' | 'marimba';
  previewPopup: boolean;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
  fontSize: 'normal' | 'large' | 'huge';
  desktopNotice: boolean;
  autoLogin: boolean;
}
