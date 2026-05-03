import { useEffect, useState } from "react";
import { StarSky } from "./components/StarSky";
import { StarDetailPlaceholder } from "./components/StarDetailPlaceholder";

export default function App() {
  const [ready, setReady] = useState(false);
  const [selectedToothId, setSelectedToothId] = useState<string | null>(null);

  // Schritt 2: keine Speicherung — leere Set, nichts leuchtet noch.
  // Ab Schritt 4 wird hier die echte Liste aus IndexedDB stehen.
  const litToothIds = new Set<string>();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`app-shell ${ready ? "ready" : ""}`}>
      <div className="sky-bg" aria-hidden="true">
        <div className="nebula a" />
        <div className="nebula b" />
        <div className="nebula c" />
        <div className="stars-static" />
      </div>

      <header className="app-header">
        <p className="kid-greeting">
          <span className="kid-name">Milky</span>
        </p>
        <p className="hint">Tippe einen Stern an</p>
      </header>

      <main className="constellation-stage">
        <StarSky litToothIds={litToothIds} onSelect={setSelectedToothId} />
      </main>

      <footer className="app-footer">
        <p className="footer-step">Schritt 2 — Sternenkarte</p>
      </footer>

      <StarDetailPlaceholder
        toothId={selectedToothId}
        onClose={() => setSelectedToothId(null)}
      />
    </div>
  );
}
