/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BrowserPopupType =
  | 'note-compose'
  | 'note-view'
  | 'chat'
  | 'received-notes'
  | 'sent-notes'
  | 'notices'
  | 'polls';

export interface PopupOpenOptions {
  width?: number;
  height?: number;
  recipientIds?: string[];
  replyTitle?: string;
  noteId?: string;
  roomId?: string;
}

// BroadcastChannel for cross-window real-time communication
export const SYNC_CHANNEL_NAME = 'gwnd_messenger_sync_channel';

export const getMessengerChannel = (): BroadcastChannel | null => {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      return new BroadcastChannel(SYNC_CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Opens an actual native browser popup window (window.open).
 * If blocked by browser popup blocker or sandbox, returns null.
 */
export const openBrowserPopup = (
  type: BrowserPopupType,
  options: PopupOpenOptions = {}
): Window | null => {
  if (typeof window === 'undefined') return null;

  const width = options.width || (type === 'chat' ? 820 : 760);
  const height = options.height || (type === 'chat' ? 680 : 640);

  // Stagger cascading coordinates so multiple popup windows appear nicely separated
  const seed = Date.now() % 6;
  const offsetX = (seed - 2) * 35;
  const offsetY = (seed - 2) * 30;

  const screenLeft = window.screenLeft ?? window.screenX ?? 0;
  const screenTop = window.screenTop ?? window.screenY ?? 0;
  const outerWidth = window.outerWidth || window.innerWidth || 1024;
  const outerHeight = window.outerHeight || window.innerHeight || 768;

  const left = Math.max(20, Math.round(screenLeft + (outerWidth - width) / 2 + offsetX));
  const top = Math.max(20, Math.round(screenTop + (outerHeight - height) / 2 + offsetY));

  const query = new URLSearchParams();
  query.set('popup', type);
  query.set('_winId', `win_${Date.now()}_${Math.floor(Math.random() * 10000)}`);

  if (options.noteId) query.set('noteId', options.noteId);
  if (options.roomId) query.set('roomId', options.roomId);
  if (options.replyTitle) query.set('replyTitle', options.replyTitle);
  if (options.recipientIds && options.recipientIds.length > 0) {
    query.set('recipients', options.recipientIds.join(','));
  }

  // Preserve existing origin and path
  const targetUrl = `${window.location.origin}${window.location.pathname}?${query.toString()}`;
  const windowTarget = `GWND_${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const features = `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,personalbar=no,directories=no,resizable=yes,scrollbars=yes`;

  try {
    const newWindow = window.open(targetUrl, windowTarget, features);
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      return null;
    }
    try {
      newWindow.focus();
    } catch {
      // ignore
    }
    return newWindow;
  } catch (err) {
    console.warn('Browser popup open blocked or failed:', err);
    return null;
  }
};
