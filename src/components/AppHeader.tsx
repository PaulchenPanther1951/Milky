import { useState } from "react";
import { useProfileContext } from "../lib/profile-context";
import { Avatar } from "./Avatar";
import { ProfileSwitcher } from "./ProfileSwitcher";

export function AppHeader() {
  const { activeProfile, profiles } = useProfileContext();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  if (!activeProfile) return null;

  return (
    <>
      <header className="app-header">
        <button
          type="button"
          className="profile-button"
          onClick={() => setSwitcherOpen(true)}
          aria-label="Profil wechseln"
        >
          <Avatar name={activeProfile.name} photoKey={activeProfile.photoKey} size={48} />
          <div className="profile-meta">
            <span className="kid-name">{activeProfile.name}</span>
            {profiles.length > 1 && (
              <span className="switch-hint">{profiles.length} Kinder · tippe zum Wechseln</span>
            )}
            {profiles.length === 1 && <span className="switch-hint">Tippe für Profil & Einstellungen</span>}
          </div>
          <svg
            className="chevron"
            viewBox="0 0 20 20"
            width="14"
            height="14"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>

      {switcherOpen && <ProfileSwitcher onClose={() => setSwitcherOpen(false)} />}
    </>
  );
}
