import { useEffect, useState } from "react";

export default function App() {
  const [ready, setReady] = useState(false);

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

      <main className="welcome">
        <p className="kicker">Milky</p>
        <h1>Eine kleine Galaxie fuer jeden ausgefallenen Milchzahn.</h1>
        <p className="lede">
          Schritt 1 ist bereit — das Geruest steht. Sterne, Profile und Diary kommen ab Schritt 2.
        </p>
        <p className="studio">by Fianuk Studio</p>
      </main>
    </div>
  );
}
