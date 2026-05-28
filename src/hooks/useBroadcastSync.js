import { useRef, useEffect, useCallback } from "react";
import { makeChannel } from "../utils/api.js";

export function useBroadcastSync(onRemoteUpdate) {
  const channel = useRef(null);

  useEffect(() => {
    channel.current = makeChannel();
    if (!channel.current) return;
    channel.current.onmessage = (ev) => {
      if (ev.data?.type === "ITEMS_UPDATED") onRemoteUpdate(ev.data.items);
    };
    return () => channel.current?.close();
  }, [onRemoteUpdate]);

  const broadcast = useCallback((items) => {
    try { channel.current?.postMessage({ type: "ITEMS_UPDATED", items }); } catch {}
  }, []);

  return broadcast;
}
