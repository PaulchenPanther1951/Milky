import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Profile } from "../types";
import * as db from "./db";
import { applyTheme } from "./themes";

interface ProfileContextValue {
  profiles: Profile[];
  activeProfile: Profile | null;
  loading: boolean;
  setActiveProfile: (id: string) => Promise<void>;
  saveProfile: (profile: Profile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await db.listProfiles();
    const activeId = await db.getActiveProfileId();
    setProfiles(all);
    const active = all.find((p) => p.id === activeId) ?? all[0] ?? null;
    setActiveProfileState(active);
    if (active) applyTheme(active.theme);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const setActiveProfile = useCallback(
    async (id: string) => {
      await db.setActiveProfileId(id);
      await refresh();
    },
    [refresh]
  );

  const saveProfile = useCallback(
    async (profile: Profile) => {
      await db.putProfile(profile);
      const meta = await db.getMeta();
      if (!meta.activeProfileId) {
        await db.setActiveProfileId(profile.id);
      }
      await refresh();
    },
    [refresh]
  );

  const deleteProfile = useCallback(
    async (id: string) => {
      await db.deleteProfileCascade(id);
      const remaining = await db.listProfiles();
      const activeId = await db.getActiveProfileId();
      if (activeId === id) {
        await db.setActiveProfileId(remaining[0]?.id ?? null);
      }
      await refresh();
    },
    [refresh]
  );

  const value = useMemo<ProfileContextValue>(
    () => ({ profiles, activeProfile, loading, setActiveProfile, saveProfile, deleteProfile, refresh }),
    [profiles, activeProfile, loading, setActiveProfile, saveProfile, deleteProfile, refresh]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileContext(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfileContext must be used inside <ProfileProvider>");
  return ctx;
}
