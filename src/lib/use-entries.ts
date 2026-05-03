import { useCallback, useEffect, useState } from "react";
import type { ToothEntry } from "../types";
import { listEntriesByProfile } from "./db";

export function entryIdFor(profileId: string, toothId: string): string {
  return `${profileId}__${toothId}`;
}

export function useEntries(profileId: string | null | undefined) {
  const [entries, setEntries] = useState<ToothEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profileId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    const all = await listEntriesByProfile(profileId);
    setEntries(all);
    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, refresh };
}
