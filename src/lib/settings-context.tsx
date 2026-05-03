import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMeta, patchMeta } from "./db";

interface SettingsValue {
  soundsEnabled: boolean;
  loading: boolean;
  setSoundsEnabled: (v: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [soundsEnabled, setSoundsEnabledState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeta()
      .then((meta) => setSoundsEnabledState(meta.soundsEnabled ?? false))
      .finally(() => setLoading(false));
  }, []);

  const setSoundsEnabled = useCallback(async (v: boolean) => {
    await patchMeta({ soundsEnabled: v });
    setSoundsEnabledState(v);
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({ soundsEnabled, loading, setSoundsEnabled }),
    [soundsEnabled, loading, setSoundsEnabled]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
