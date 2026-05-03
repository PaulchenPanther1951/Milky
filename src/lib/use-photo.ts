import { useEffect, useState } from "react";
import { getPhoto } from "./db";
import { blobToObjectUrl } from "./image";

/**
 * Loads a photo blob from IndexedDB and exposes a stable object URL.
 * Revokes the URL on unmount or when the key changes.
 */
export function usePhoto(key: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let currentUrl: string | null = null;

    if (!key) {
      setUrl(null);
      return;
    }

    (async () => {
      const blob = await getPhoto(key);
      if (!active || !blob) {
        if (active) setUrl(null);
        return;
      }
      currentUrl = blobToObjectUrl(blob);
      setUrl(currentUrl);
    })();

    return () => {
      active = false;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [key]);

  return url;
}
