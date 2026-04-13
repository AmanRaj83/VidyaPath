// ─── useOffline Hook ─────────────────────────────────────────────────────────
// Listens to browser online/offline events and exposes the current state.
// Works with the Web API — no libraries required.

import { useEffect, useState } from "react";

export interface UseOfflineReturn {
  isOnline: boolean;
  isOffline: boolean;
  /** Timestamp when connectivity last changed */
  lastChanged: Date | null;
}

export const useOffline = (): UseOfflineReturn => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastChanged, setLastChanged] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastChanged(new Date());
    };
    const handleOffline = () => {
      setIsOnline(false);
      setLastChanged(new Date());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    lastChanged,
  };
};
