import { useEffect, useMemo, useRef, useState } from "react";
import { ProfileProvider, useProfileContext } from "./lib/profile-context";
import { SettingsProvider } from "./lib/settings-context";
import { useEntries } from "./lib/use-entries";
import { computeAchieved } from "./lib/milestones";
import { StarSky } from "./components/StarSky";
import { StarDetail } from "./components/StarDetail";
import { Onboarding } from "./components/Onboarding";
import { AppHeader } from "./components/AppHeader";
import { MilestoneCelebration } from "./components/MilestoneCelebration";
import { ThemeScene } from "./components/ThemeScene";

export default function App() {
  return (
    <SettingsProvider>
      <ProfileProvider>
        <Shell />
      </ProfileProvider>
    </SettingsProvider>
  );
}

function Shell() {
  const { activeProfile, loading } = useProfileContext();

  return (
    <div className="app-shell ready">
      <div className="sky-bg" aria-hidden="true">
        <div className="nebula a" />
        <div className="nebula b" />
        <div className="nebula c" />
        <div className="stars-static" />
      </div>
      <ThemeScene />

      {loading ? (
        <BootScreen />
      ) : activeProfile ? (
        <MainView />
      ) : (
        <Onboarding />
      )}
    </div>
  );
}

function BootScreen() {
  return (
    <main className="boot-screen">
      <p className="boot-title">Milky</p>
    </main>
  );
}

function MainView() {
  const { activeProfile, saveProfile } = useProfileContext();
  const profileId = activeProfile?.id;
  const { entries, refresh } = useEntries(profileId);
  const [selectedToothId, setSelectedToothId] = useState<string | null>(null);
  const [celebrationQueue, setCelebrationQueue] = useState<string[]>([]);
  const [burstingToothId, setBurstingToothId] = useState<string | null>(null);

  const baselineEstablishedRef = useRef<string | null>(null);
  const burstTimerRef = useRef<number | null>(null);

  // Cleanup burst timer on unmount
  useEffect(() => {
    return () => {
      if (burstTimerRef.current !== null) {
        window.clearTimeout(burstTimerRef.current);
      }
    };
  }, []);

  const handleSaved = (toothId: string, isNew: boolean) => {
    refresh();
    if (!isNew) return;
    if (burstTimerRef.current !== null) window.clearTimeout(burstTimerRef.current);
    setBurstingToothId(toothId);
    burstTimerRef.current = window.setTimeout(() => {
      setBurstingToothId(null);
      burstTimerRef.current = null;
    }, 1600);
  };

  // Reset baseline tracking when active profile changes
  useEffect(() => {
    baselineEstablishedRef.current = null;
  }, [profileId]);

  // Watch for newly satisfied milestones
  useEffect(() => {
    if (!activeProfile) return;
    const achieved = computeAchieved(entries);
    const celebrated = activeProfile.celebratedMilestones;

    // First time tracking for this profile: silently set baseline
    if (celebrated === undefined && baselineEstablishedRef.current !== activeProfile.id) {
      baselineEstablishedRef.current = activeProfile.id;
      saveProfile({ ...activeProfile, celebratedMilestones: achieved });
      return;
    }

    if (!celebrated) return;
    const newOnes = achieved.filter((id) => !celebrated.includes(id));
    if (newOnes.length > 0) {
      setCelebrationQueue((q) => [...q, ...newOnes]);
      saveProfile({ ...activeProfile, celebratedMilestones: [...celebrated, ...newOnes] });
    }
  }, [entries, activeProfile, saveProfile]);

  const litToothIds = useMemo(() => new Set(entries.map((e) => e.toothId)), [entries]);
  const existingEntry = useMemo(() => {
    if (!selectedToothId) return null;
    return entries.find((e) => e.toothId === selectedToothId) ?? null;
  }, [entries, selectedToothId]);

  if (!activeProfile) return null;

  return (
    <>
      <AppHeader />
      <main className="constellation-stage">
        <StarSky
          litToothIds={litToothIds}
          entries={entries}
          burstingToothId={burstingToothId}
          onSelect={setSelectedToothId}
        />
      </main>
      <footer className="app-footer">
        <p className="footer-step">
          {entries.length === 0
            ? "Tippe einen Stern an und halte den ersten Zahn fest."
            : `${entries.length} ${entries.length === 1 ? "Stern" : "Sterne"} leuchten · noch ${20 - entries.length} zu gehen`}
        </p>
        {entries.length > 0 && (
          <p className="footer-backup-hint">
            <svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M10 3v9m0 0l-3-3m3 3l3-3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2" strokeLinecap="round" />
            </svg>
            Tipp: Backup für den Gerätewechsel — <em>Profil → Einstellungen → Backup</em>
          </p>
        )}
        <p className="footer-brand">
          made with care by <span className="footer-brand-name">Fianuk Studio</span>
        </p>
      </footer>
      <StarDetail
        toothId={selectedToothId}
        profile={activeProfile}
        existingEntry={existingEntry}
        onClose={() => setSelectedToothId(null)}
        onSaved={handleSaved}
      />
      {celebrationQueue.length > 0 && (
        <MilestoneCelebration
          key={celebrationQueue[0]}
          milestoneId={celebrationQueue[0]}
          onDismiss={() => setCelebrationQueue((q) => q.slice(1))}
        />
      )}
    </>
  );
}
