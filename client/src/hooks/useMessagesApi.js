// client/src/hooks/useMessagesApi.js
import { useCallback } from 'react';

export const fetchMessages = async ({ room = 'global', limit = 20, offset = 0 }) => {
  const res = await fetch(`/api/messages?room=${encodeURIComponent(room)}&limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
};
