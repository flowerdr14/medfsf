export type WindowType =
  | 'note-compose'
  | 'note-view'
  | 'notes-list-received'
  | 'notes-list-sent'
  | 'files-list-received'
  | 'files-list-sent'
  | 'chat'
  | 'notices'
  | 'polls'
  | 'profile'
  | 'settings'
  | 'login'
  | 'media';

export interface WindowInstance {
  id: string;
  title: string;
  type: WindowType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized?: boolean;
  isMaximized?: boolean;
  data?: any; // e.g. noteId, roomId, recipientIds, media object
}
