import { useState, useRef, useCallback, useEffect } from "react";
import { api, retry } from "../utils/api.js";

export function useOfflineQueue(online) {
  const [queue, setQueue] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const queueRef = useRef([]);
  const onlineRef = useRef(online);
  const drainingRef = useRef(false);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { onlineRef.current = online; }, [online]);

  const drainQueue = useCallback(async () => {
    if (!onlineRef.current || drainingRef.current) return;
    if (queueRef.current.length === 0) return;
    drainingRef.current = true;
    setSyncing(true);
    try {
      while (onlineRef.current && queueRef.current.length > 0) {
        const m = queueRef.current[0];
        try {
          await retry(() => api.pushMutation(m), 3);
          queueRef.current = queueRef.current.filter((x) => x._id !== m._id);
          setQueue((q) => q.filter((x) => x._id !== m._id));
        } catch {
          break;
        }
      }
    } finally {
      drainingRef.current = false;
      setSyncing(false);
    }
  }, []);

  const enqueue = useCallback((mutation) => {
    setQueue((q) => [...q, { ...mutation, _id: Date.now() + Math.random() }]);
  }, []);

  // Auto-drain whenever connectivity is restored or queue grows.
  useEffect(() => {
    if (online && queue.length) drainQueue();
  }, [online, queue.length, drainQueue]);

  return { queue, syncing, drainQueue, enqueue };
}
