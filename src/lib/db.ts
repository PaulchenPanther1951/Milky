import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Profile, ToothEntry } from "../types";

interface PhotoRecord {
  id: string;
  blob: Blob;
  createdAt: string;
}

interface MetaRecord {
  activeProfileId?: string;
  soundsEnabled?: boolean;
  unlockedMilestones?: string[];
}

interface MilkyDB extends DBSchema {
  profiles: {
    key: string;
    value: Profile;
    indexes: { "by-createdAt": string };
  };
  entries: {
    key: string;
    value: ToothEntry;
    indexes: { "by-profile": string };
  };
  photos: {
    key: string;
    value: PhotoRecord;
  };
  audio: {
    key: string;
    value: PhotoRecord; // same shape; reusing record for blob+id+createdAt
  };
  meta: {
    key: string;
    value: MetaRecord;
  };
}

const DB_NAME = "milky";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MilkyDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<MilkyDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MilkyDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const profilesStore = db.createObjectStore("profiles", { keyPath: "id" });
        profilesStore.createIndex("by-createdAt", "createdAt");

        const entriesStore = db.createObjectStore("entries", { keyPath: "id" });
        entriesStore.createIndex("by-profile", "profileId");

        db.createObjectStore("photos", { keyPath: "id" });
        db.createObjectStore("audio", { keyPath: "id" });
        db.createObjectStore("meta");
      },
    });
  }
  return dbPromise;
}

// ---------- Profiles ----------

export async function listProfiles(): Promise<Profile[]> {
  const db = await getDB();
  return db.getAllFromIndex("profiles", "by-createdAt");
}

export async function getProfile(id: string): Promise<Profile | undefined> {
  const db = await getDB();
  return db.get("profiles", id);
}

export async function putProfile(profile: Profile): Promise<void> {
  const db = await getDB();
  await db.put("profiles", profile);
}

export async function deleteProfileCascade(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["profiles", "entries", "photos", "audio"], "readwrite");
  await tx.objectStore("profiles").delete(id);
  const entryIndex = tx.objectStore("entries").index("by-profile");
  let cursor = await entryIndex.openCursor(id);
  while (cursor) {
    const entry = cursor.value;
    if (entry.photoBeforeKey) await tx.objectStore("photos").delete(entry.photoBeforeKey);
    if (entry.photoAfterKey) await tx.objectStore("photos").delete(entry.photoAfterKey);
    if (entry.audioMemoKey) await tx.objectStore("audio").delete(entry.audioMemoKey);
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

// ---------- Entries ----------

export async function listEntriesByProfile(profileId: string): Promise<ToothEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex("entries", "by-profile", profileId);
}

export async function getEntry(id: string): Promise<ToothEntry | undefined> {
  const db = await getDB();
  return db.get("entries", id);
}

export async function putEntry(entry: ToothEntry): Promise<void> {
  const db = await getDB();
  await db.put("entries", entry);
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB();
  const entry = await db.get("entries", id);
  if (!entry) return;
  const tx = db.transaction(["entries", "photos", "audio"], "readwrite");
  if (entry.photoBeforeKey) await tx.objectStore("photos").delete(entry.photoBeforeKey);
  if (entry.photoAfterKey) await tx.objectStore("photos").delete(entry.photoAfterKey);
  if (entry.audioMemoKey) await tx.objectStore("audio").delete(entry.audioMemoKey);
  await tx.objectStore("entries").delete(id);
  await tx.done;
}

// ---------- Photos ----------

export async function savePhoto(blob: Blob): Promise<string> {
  const id = `photo_${randomId()}`;
  const db = await getDB();
  await db.put("photos", { id, blob, createdAt: new Date().toISOString() });
  return id;
}

export async function getPhoto(id: string): Promise<Blob | undefined> {
  const db = await getDB();
  const record = await db.get("photos", id);
  return record?.blob;
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("photos", id);
}

// ---------- Audio ----------

export async function saveAudio(blob: Blob): Promise<string> {
  const id = `audio_${randomId()}`;
  const db = await getDB();
  await db.put("audio", { id, blob, createdAt: new Date().toISOString() });
  return id;
}

export async function getAudio(id: string): Promise<Blob | undefined> {
  const db = await getDB();
  const record = await db.get("audio", id);
  return record?.blob;
}

export async function deleteAudio(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("audio", id);
}

// ---------- Meta ----------

export async function getMeta(): Promise<MetaRecord> {
  const db = await getDB();
  return (await db.get("meta", "default")) ?? {};
}

export async function patchMeta(patch: Partial<MetaRecord>): Promise<void> {
  const db = await getDB();
  const current = (await db.get("meta", "default")) ?? {};
  await db.put("meta", { ...current, ...patch }, "default");
}

export async function setActiveProfileId(id: string | null): Promise<void> {
  await patchMeta({ activeProfileId: id ?? undefined });
}

export async function getActiveProfileId(): Promise<string | undefined> {
  const meta = await getMeta();
  return meta.activeProfileId;
}

// ---------- Export / Import (used in Schritt 8) ----------

export async function exportAll(): Promise<{
  profiles: Profile[];
  entries: ToothEntry[];
  photos: { id: string; mime: string; data: string }[];
  audio: { id: string; mime: string; data: string }[];
  meta: MetaRecord;
  exportedAt: string;
  version: number;
}> {
  const db = await getDB();
  const profiles = await db.getAll("profiles");
  const entries = await db.getAll("entries");
  const photoRecs = await db.getAll("photos");
  const audioRecs = await db.getAll("audio");
  const meta = (await db.get("meta", "default")) ?? {};
  const photos = await Promise.all(
    photoRecs.map(async (r) => ({ id: r.id, mime: r.blob.type || "image/jpeg", data: await blobToBase64(r.blob) }))
  );
  const audio = await Promise.all(
    audioRecs.map(async (r) => ({ id: r.id, mime: r.blob.type || "audio/webm", data: await blobToBase64(r.blob) }))
  );
  return { profiles, entries, photos, audio, meta, exportedAt: new Date().toISOString(), version: 1 };
}

export async function importAll(payload: Awaited<ReturnType<typeof exportAll>>): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["profiles", "entries", "photos", "audio", "meta"], "readwrite");
  await tx.objectStore("profiles").clear();
  await tx.objectStore("entries").clear();
  await tx.objectStore("photos").clear();
  await tx.objectStore("audio").clear();
  await tx.objectStore("meta").clear();
  for (const p of payload.profiles) await tx.objectStore("profiles").put(p);
  for (const e of payload.entries) await tx.objectStore("entries").put(e);
  for (const photo of payload.photos) {
    const blob = await base64ToBlob(photo.data, photo.mime);
    await tx.objectStore("photos").put({ id: photo.id, blob, createdAt: new Date().toISOString() });
  }
  for (const a of payload.audio) {
    const blob = await base64ToBlob(a.data, a.mime);
    await tx.objectStore("audio").put({ id: a.id, blob, createdAt: new Date().toISOString() });
  }
  await tx.objectStore("meta").put(payload.meta, "default");
  await tx.done;
}

// ---------- helpers ----------

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function newId(prefix: string): string {
  return `${prefix}_${randomId()}`;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function base64ToBlob(b64: string, mime: string): Promise<Blob> {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
