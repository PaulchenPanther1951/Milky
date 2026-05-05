export type PersistState = "granted" | "prompt-needed" | "unsupported";

export async function checkPersisted(): Promise<PersistState> {
  if (!navigator.storage?.persisted) return "unsupported";
  const persisted = await navigator.storage.persisted();
  return persisted ? "granted" : "prompt-needed";
}

export async function requestPersist(): Promise<PersistState> {
  if (!navigator.storage?.persist) return "unsupported";
  const granted = await navigator.storage.persist();
  return granted ? "granted" : "prompt-needed";
}

export interface StorageInfo {
  usedBytes: number;
  quotaBytes: number;
  usedLabel: string;
  quotaLabel: string;
}

export async function getStorageInfo(): Promise<StorageInfo | null> {
  if (!navigator.storage?.estimate) return null;
  try {
    const est = await navigator.storage.estimate();
    const used = est.usage ?? 0;
    const quota = est.quota ?? 0;
    return {
      usedBytes: used,
      quotaBytes: quota,
      usedLabel: formatBytes(used),
      quotaLabel: formatBytes(quota),
    };
  } catch {
    return null;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
