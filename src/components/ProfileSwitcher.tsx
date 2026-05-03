import { useEffect, useState } from "react";
import { useProfileContext } from "../lib/profile-context";
import { useSettings } from "../lib/settings-context";
import { Avatar } from "./Avatar";
import { ProfileEditor } from "./ProfileEditor";
import { applyTheme } from "../lib/themes";

interface Props {
  onClose: () => void;
}

type Mode =
  | { kind: "list" }
  | { kind: "add" }
  | { kind: "edit"; profileId: string }
  | { kind: "settings" };

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
    if (mode.kind === "edit") {
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
              onClick={() => setMode({ kind: "settings" })}
            >
              Einstellungen
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
              {profiles.length > 1 && (
                <button
                  type="button"
                  className="btn btn-danger-ghost btn-block"
                  onClick={async () => {
                    if (confirm(`${target.name} und ihre/seine Galaxie wirklich loeschen?`)) {
                      await deleteProfile(target.id);
                      setMode({ kind: "list" });
                    }
                  }}
                >
                  Profil loeschen
                </button>
              )}
            </>
          );
        })()}
      </div>
    </div>
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
