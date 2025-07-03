import { useRef, useEffect } from 'react';

const MESSAGE_DEDUPE_WINDOW = 5000;
const MESSAGE_CLEANUP_INTERVAL = 10000;

export const useMessageDeduplication = () => {
  const recentMessagesRef = useRef(new Map());
  const cleanupTimerRef = useRef(null);

  useEffect(() => {
    const cleanupOldEntries = () => {
      const now = Date.now();
      for (const [key, timestamp] of recentMessagesRef.current.entries()) {
        if (now - timestamp > MESSAGE_CLEANUP_INTERVAL) {
          recentMessagesRef.current.delete(key);
        }
      }
    };

    cleanupTimerRef.current = setInterval(cleanupOldEntries, MESSAGE_CLEANUP_INTERVAL);
    return () => {
      if (cleanupTimerRef.current) {
        clearInterval(cleanupTimerRef.current);
      }
    };
  }, []);

  const checkDuplicate = (messageKey) => {
    const now = Date.now();
    const lastSeenTime = recentMessagesRef.current.get(messageKey);
    
    if (lastSeenTime && now - lastSeenTime < MESSAGE_DEDUPE_WINDOW) {
      return true;
    }
    
    recentMessagesRef.current.set(messageKey, now);
    return false;
  };

  return { checkDuplicate };
};
