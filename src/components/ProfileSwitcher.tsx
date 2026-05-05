import { useEffect, useState } from "react";
import { useProfileContext } from "../lib/profile-context";
import { useSettings } from "../lib/settings-context";
import { Avatar } from "./Avatar";
import { ProfileEditor } from "./ProfileEditor";
import { applyTheme } from "../lib/themes";
import { MILESTONES, computeAchieved } from "../lib/milestones";
import { listEntriesByProfile } from "../lib/db";
import type { ToothEntry } from "../types";
import { ExportImport } from "./ExportImport";

interface Props {
  onClose: () => void;
}

type Mode =
  | { kind: "list" }
  | { kind: "add" }
  | { kind: "edit"; profileId: string }
  | { kind: "delete"; profileId: string }
  | { kind: "settings" }
  | { kind: "milestones" }
  | { kind: "about" };

export function ProfileSwitcher({ onClose }: Props) {
  const { profiles, activeProfile, setActiveProfile, saveProfile, deleteProfile } =
    useProfileContext();
  const { soundsEnabled, setSoundsEnabled } = useSettings();
  const [mode, setMode] = useState<Mode>({ kind: "list" });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mode.kind === "list") onClose();
        else setMode({ kind: "list" });
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mode, onClose]);

  // When opening Edit, pre-apply that profile's theme so the form preview matches
  // and restore active profile's theme on close
  useEffect(() => {
    if (mode.kind === "edit" || mode.kind === "delete") {
      const target = profiles.find((p) => p.id === mode.profileId);
      if (target) applyTheme(target.theme);
    } else if (mode.kind === "add") {
      // already galaxie default
    } else if (activeProfile) {
      applyTheme(activeProfile.theme);
    }
  }, [mode, profiles, activeProfile]);

  return (
    <div className="modal-veil" onClick={() => (mode.kind === "list" ? onClose() : setMode({ kind: "list" }))} role="dialog" aria-modal="true">
      <div className="modal-card switcher-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={() => (mode.kind === "list" ? onClose() : setMode({ kind: "list" }))}
          aria-label="Schließen"
        >
          ×
        </button>

        {mode.kind === "list" && (
          <>
            <p className="modal-kicker">Profile</p>
            <h2 className="modal-title">Wer baut gerade?</h2>
            <ul className="profile-list">
              {profiles.map((p) => (
                <li key={p.id} className={`profile-row ${activeProfile?.id === p.id ? "active" : ""}`}>
                  <button
                    type="button"
                    className="profile-row-main"
                    onClick={async () => {
                      await setActiveProfile(p.id);
                      onClose();
                    }}
                  >
                    <Avatar name={p.name} photoKey={p.photoKey} size={42} />
                    <div className="profile-row-meta">
                      <span className="profile-row-name">{p.name}</span>
                      <span className="profile-row-sub">
                        {p.theme === "galaxie" && "Galaxie"}
                        {p.theme === "korallenriff" && "Korallenriff"}
                        {p.theme === "drachenwald" && "Drachenwald"}
                        {p.theme === "wolkenreich" && "Wolkenreich"}
                        {p.birthdate && ` · ${formatBirth(p.birthdate)}`}
                      </span>
                    </div>
                    {activeProfile?.id === p.id && <span className="active-pill">aktiv</span>}
                  </button>
                  <button
                    type="button"
                    className="profile-row-edit"
                    onClick={() => setMode({ kind: "edit", profileId: p.id })}
                    aria-label={`${p.name} bearbeiten`}
                  >
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M3 17l4-1 9-9-3-3-9 9-1 4z" strokeLinejoin="round" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            <button type="button" className="btn btn-ghost btn-block" onClick={() => setMode({ kind: "add" })}>
              + Neues Kind
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-block settings-link"
              onClick={() => setMode({ kind: "milestones" })}
            >
              Meilensteine
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-block settings-link"
              onClick={() => setMode({ kind: "settings" })}
            >
              Einstellungen
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-block settings-link"
              onClick={() => setMode({ kind: "about" })}
            >
              Über Milky
            </button>
          </>
        )}

        {mode.kind === "settings" && (
          <>
            <p className="modal-kicker">Einstellungen</p>
            <h2 className="modal-title">Wie soll Milky sein?</h2>

            <div className="settings-group">
              <label className="settings-row">
                <div className="settings-row-text">
                  <span className="settings-row-name">Sounds</span>
                  <span className="settings-row-sub">
                    Ein leises Glöckchen, wenn ein Stern aufleuchtet.
                  </span>
                </div>
                <span className={`switch ${soundsEnabled ? "on" : ""}`}>
                  <input
                    type="checkbox"
                    checked={soundsEnabled}
                    onChange={(e) => setSoundsEnabled(e.target.checked)}
                  />
                  <span className="switch-track" />
                  <span className="switch-thumb" />
                </span>
              </label>
            </div>

            <p className="settings-hint">
              Das Theme (Galaxie, Korallenriff, Drachenwald, Wolkenreich) waehlst du im
              jeweiligen Profil — tippe in der Liste auf das Stift-Symbol neben einem Kind.
            </p>

            <div className="settings-section-title">Backup &amp; Wiederherstellen</div>
            <ExportImport />
          </>
        )}

        {mode.kind === "add" && (
          <>
            <p className="modal-kicker">Neues Kind</p>
            <h2 className="modal-title">Wer kommt dazu?</h2>
            <ProfileEditor
              onSubmit={async (profile) => {
                await saveProfile(profile);
                await setActiveProfile(profile.id);
                onClose();
              }}
              onCancel={() => setMode({ kind: "list" })}
              submitLabel="Galaxie eröffnen"
            />
          </>
        )}

        {mode.kind === "edit" && (() => {
          const target = profiles.find((p) => p.id === mode.profileId);
          if (!target) return null;
          return (
            <>
              <p className="modal-kicker">Bearbeiten</p>
              <h2 className="modal-title">Über {target.name}</h2>
              <ProfileEditor
                initial={target}
                onSubmit={async (profile) => {
                  await saveProfile(profile);
                  setMode({ kind: "list" });
                }}
                onCancel={() => setMode({ kind: "list" })}
                submitLabel="Festhalten"
              />
              <button
                type="button"
                className="btn btn-danger-ghost btn-block"
                onClick={() => setMode({ kind: "delete", profileId: target.id })}
              >
                {target.name} aus Milky entfernen
              </button>
            </>
          );
        })()}

        {mode.kind === "delete" && (() => {
          const target = profiles.find((p) => p.id === mode.profileId);
          if (!target) return null;
          return (
            <DeletePane
              profileName={target.name}
              onCancel={() => setMode({ kind: "edit", profileId: target.id })}
              onConfirm={async () => {
                await deleteProfile(target.id);
                setMode({ kind: "list" });
              }}
            />
          );
        })()}

        {mode.kind === "milestones" && activeProfile && (
          <MilestonesPane profileId={activeProfile.id} profileName={activeProfile.name} />
        )}

        {mode.kind === "about" && <AboutPane />}
      </div>
    </div>
  );
}

function MilestonesPane({ profileId, profileName }: { profileId: string; profileName: string }) {
  const [entries, setEntries] = useState<ToothEntry[] | null>(null);
  useEffect(() => {
    listEntriesByProfile(profileId).then(setEntries);
  }, [profileId]);

  const achieved = entries ? new Set(computeAchieved(entries)) : new Set<string>();

  return (
    <>
      <p className="modal-kicker">Meilensteine</p>
      <h2 className="modal-title">{profileName}s Galaxie</h2>
      <ul className="milestone-list">
        {MILESTONES.map((m) => {
          const unlocked = achieved.has(m.id);
          return (
            <li key={m.id} className={`milestone-item ${unlocked ? "unlocked" : "locked"}`}>
              <span className="milestone-dot" aria-hidden="true">
                {unlocked ? "✦" : "·"}
              </span>
              <div className="milestone-text">
                <span className="milestone-name">{m.name}</span>
                <span className="milestone-desc-small">{m.description}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function AboutPane() {
  return (
    <>
      <p className="modal-kicker">Über Milky</p>
      <h2 className="modal-title">Was du wissen solltest</h2>

      <section className="about-block">
        <h3 className="about-block-title">
          <span className="about-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M12 3l8 4v5c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V7l8-4z" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Deine Daten bleiben bei dir
        </h3>
        <ul className="about-list">
          <li>
            <strong>Alles lokal.</strong> Fotos, Notizen, Audio-Erinnerungen und Profile werden
            ausschließlich im Speicher deines Browsers (IndexedDB) abgelegt — sie verlassen
            niemals dein Gerät.
          </li>
          <li>
            <strong>Kein Konto, kein Login.</strong> Milky funktioniert ohne Anmeldung,
            ohne Cloud-Service und ohne Server im Hintergrund.
          </li>
          <li>
            <strong>Kein Tracking, keine Analytics.</strong> Niemand weiß, wann du Milky
            öffnest oder was du einträgst.
          </li>
          <li>
            <strong>Du behältst die Kontrolle.</strong> Über
            <em> Einstellungen → Backup &amp; Wiederherstellen</em> kannst du jederzeit
            ein Backup als Datei exportieren oder einspielen.
          </li>
          <li className="about-list-warn">
            <strong>Wichtig:</strong> Wenn du den Browser-Speicher leerst oder Milky
            deinstallierst (z.B. Cache löschen), gehen die lokalen Daten verloren —
            mach also regelmäßig ein Backup.
          </li>
        </ul>
      </section>

      <section className="about-block">
        <h3 className="about-block-title">
          <span className="about-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Wie Milky gebaut ist
        </h3>
        <ul className="about-stack">
          <li><span className="stack-tag">React</span> Bedien-Oberfläche</li>
          <li><span className="stack-tag">TypeScript</span> typsicherer Code</li>
          <li><span className="stack-tag">Vite</span> Build-Werkzeug</li>
          <li><span className="stack-tag">IndexedDB</span> lokale Datenbank im Browser</li>
          <li><span className="stack-tag">PWA · Workbox</span> offline-fähig &amp; installierbar</li>
        </ul>
        <p className="about-stack-note">
          Open-Source-Stack, kein Backend, kein externer Dienst. Milky läuft komplett
          in deinem Browser — auch ohne Internet, sobald die App einmal geladen wurde.
        </p>
      </section>

      <section className="about-brand">
        <img
          src="./branding/fianuk-logo.png"
          alt="Fianuk Studio"
          className="about-fianuk-logo"
          width={120}
          height={48}
        />
        <p className="about-brand-text">
          Made with care by <strong>Fianuk Studio</strong>
        </p>
      </section>
    </>
  );
}

function DeletePane({
  profileName,
  onCancel,
  onConfirm,
}: {
  profileName: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [typed, setTyped] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const matches = typed.trim().toLowerCase() === profileName.trim().toLowerCase();

  return (
    <>
      <p className="modal-kicker">Wirklich entfernen?</p>
      <h2 className="modal-title">{profileName} aus Milky entfernen</h2>

      <div className="danger-warning">
        <p className="danger-warning-title">Das ist endgültig.</p>
        <p className="danger-warning-text">
          Wenn du fortfährst, gehen folgende Dinge unwiderruflich verloren:
        </p>
        <ul className="danger-warning-list">
          <li>Alle dokumentierten Sterne (Milchzähne)</li>
          <li>Alle Fotos (Wackelzahn &amp; Lücke)</li>
          <li>Alle Notizen und Audio-Erinnerungen</li>
          <li>Alle bisher gefeierten Meilensteine</li>
        </ul>
        <p className="danger-warning-hint">
          Tipp: Über <em>Einstellungen &rarr; Backup &amp; Wiederherstellen</em> kannst du
          vorher noch eine Sicherungskopie exportieren.
        </p>
      </div>

      <div className="field">
        <label htmlFor="delete-confirm-name">
          Tippe zur Bestätigung den Namen <strong>{profileName}</strong> ein:
        </label>
        <input
          id="delete-confirm-name"
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          autoFocus
          placeholder={profileName}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Abbrechen
        </button>
        <button
          type="button"
          className="btn btn-danger"
          disabled={!matches || submitting}
          onClick={async () => {
            setSubmitting(true);
            try {
              await onConfirm();
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? "Lösche..." : "Endgültig entfernen"}
        </button>
      </div>
    </>
  );
}

function formatBirth(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}
