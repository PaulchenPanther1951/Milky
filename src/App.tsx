import { useMemo, useState } from "react";
import { ProfileProvider, useProfileContext } from "./lib/profile-context";
import { useEntries } from "./lib/use-entries";
import { StarSky } from "./components/StarSky";
import { StarDetail } from "./components/StarDetail";
import { Onboarding } from "./components/Onboarding";
import { AppHeader } from "./components/AppHeader";

export default function App() {
  return (
    <ProfileProvider>
      <Shell />
    </ProfileProvider>
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
  const { activeProfile } = useProfileContext();
  const profileId = activeProfile?.id;
  const { entries, refresh } = useEntries(profileId);
  const [selectedToothId, setSelectedToothId] = useState<string | null>(null);

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
          onSelect={setSelectedToothId}
        />
      </main>
      <footer className="app-footer">
        <p className="footer-step">
          {entries.length === 0
            ? "Tippe einen Stern an und halte den ersten Zahn fest."
            : `${entries.length} ${entries.length === 1 ? "Stern" : "Sterne"} leuchten · noch ${20 - entries.length} zu gehen`}
        </p>
      </footer>
      <StarDetail
        toothId={selectedToothId}
        profile={activeProfile}
        existingEntry={existingEntry}
        onClose={() => setSelectedToothId(null)}
        onSaved={refresh}
      />
    </>
  );
}
