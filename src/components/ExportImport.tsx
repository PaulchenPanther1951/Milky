import { useRef, useState } from "react";
import { exportAll, importAll } from "../lib/db";
import { useProfileContext } from "../lib/profile-context";

export function ExportImport() {
  const { refresh } = useProfileContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function doExport() {
    setBusy(true);
    setMessage(null);
    try {
      const payload = await exportAll();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `milky-backup-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      const totalPhotos = payload.photos.length;
      const totalAudio = payload.audio.length;
      setMessage(
        `Backup gespeichert: ${payload.profiles.length} Profil${payload.profiles.length === 1 ? "" : "e"}, ${payload.entries.length} Stern${payload.entries.length === 1 ? "" : "e"}, ${totalPhotos} Foto${totalPhotos === 1 ? "" : "s"}, ${totalAudio} Audio.`
      );
    } catch (err) {
      console.error("export failed", err);
      setMessage("Export fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (
      !confirm(
        "Beim Wiederherstellen werden alle aktuellen Profile und Sterne in dieser App ueberschrieben. Sicher?"
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (!payload || typeof payload !== "object" || !Array.isArray(payload.profiles)) {
        throw new Error("Datei sieht nicht nach einem Milky-Backup aus.");
      }
      await importAll(payload);
      await refresh();
      setMessage("Backup wiederhergestellt.");
    } catch (err) {
      console.error("import failed", err);
      const msg = err instanceof Error ? err.message : "Import fehlgeschlagen.";
      setMessage(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="export-import">
      <div className="ei-row">
        <button type="button" className="btn btn-ghost" onClick={doExport} disabled={busy}>
          Backup speichern
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          Backup wiederherstellen
        </button>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImportFile} />
      <p className="ei-hint">
        Backup ist eine einzelne JSON-Datei mit allen Profilen, Sternen, Fotos und Audios.
        Schick sie z.B. per Mail an dich selbst, oder leg sie in die Cloud — Milky bleibt
        ansonsten lokal.
      </p>
      {message && <p className="ei-message">{message}</p>}
    </div>
  );
}
