import { useState } from "react";
import { ProfileProvider, useProfileContext } from "./lib/profile-context";
import { StarSky } from "./components/StarSky";
import { StarDetailPlaceholder } from "./components/StarDetailPlaceholder";
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
    <div className={`app-shell ready`}>
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
  const [selectedToothId, setSelectedToothId] = useState<string | null>(null);
  // Schritt 3: noch keine Eintraege — kommt in Schritt 4 ueber useEntries
  const litToothIds = new Set<string>();

  return (
    <>
      <AppHeader />
      <main className="constellation-stage">
        <StarSky litToothIds={litToothIds} onSelect={setSelectedToothId} />
      </main>
      <footer className="app-footer">
        <p className="footer-step">Schritt 3 — Profil & Multi-Kind</p>
      </footer>
      <StarDetailPlaceholder
        toothId={selectedToothId}
        onClose={() => setSelectedToothId(null)}
      />
    </>
  );
}
