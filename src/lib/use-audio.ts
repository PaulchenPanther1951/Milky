import { useEffect, useState } from "react";
import { getAudio } from "./db";

/**
 * Loads an audio blob from IndexedDB and exposes a stable object URL.
 * Mirrors usePhoto for symmetry.
 */
export function useAudio(key: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let currentUrl: string | null = null;

    if (!key) {
      setUrl(null);
      return;
    }

    (async () => {
      const blob = await getAudio(key);
      if (!active || !blob) {
        if (active) setUrl(null);
        return;
      }
      currentUrl = URL.createObjectURL(blob);
      setUrl(currentUrl);
    })();

    return () => {
      active = false;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [key]);

  return url;
}
