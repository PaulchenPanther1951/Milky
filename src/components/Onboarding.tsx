import { useState } from "react";
import { ProfileEditor } from "./ProfileEditor";
import { useProfileContext } from "../lib/profile-context";
import { requestPersist } from "../lib/persist";

export function Onboarding() {
  const { saveProfile } = useProfileContext();
  const [step, setStep] = useState<"welcome" | "profile">("welcome");
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="onboarding">
      {step === "welcome" && (
        <div className="onboarding-screen welcome-screen">
          <div className="fianuk-presents">
            <img
              src="./branding/fianuk-logo.png"
              alt="Fianuk Studio"
              className="fianuk-logo"
              width={140}
              height={56}
            />
            <span className="fianuk-presents-text">proudly presents</span>
          </div>
          <h1 className="milky-wordmark" aria-label="Milky">
            <span aria-hidden="true">Milky</span>
          </h1>
          <p className="onboarding-kicker">Willkommen</p>
          <h2 className="welcome-tagline">Eine kleine Galaxie für jeden ausgefallenen Milchzahn.</h2>
          <p className="onboarding-lede">
            Milky ist ein Tagebuch für die Wackelzahn-Zeit. Mit jedem Zahn, den ihr festhaltet,
            leuchtet ein Stern mehr — bis am Ende eine ganze kleine Konstellation entstanden ist.
          </p>
          <button type="button" className="btn btn-primary btn-large" onClick={() => setStep("profile")}>
            Los geht's
          </button>
          <p className="privacy-pill">
            <span className="privacy-dot" aria-hidden="true">·</span>
            Alles bleibt auf deinem Gerät · kein Account · kein Tracking
          </p>
          <p className="install-hint">
            Tipp: {isIOS ? "Tippe unten auf Teilen → \"Zum Home-Bildschirm\"" : "Tippe ins Browser-Menü → \"Zum Startbildschirm hinzufügen\""},
            dann hast du Milky immer griffbereit.
          </p>
        </div>
      )}

      {step === "profile" && (
        <div className="onboarding-screen profile-screen">
          <p className="onboarding-kicker">Erstes Kind</p>
          <h2>Wer baut die erste Galaxie?</h2>
          <ProfileEditor
            onSubmit={async (profile) => {
              await saveProfile(profile);
              try { await requestPersist(); } catch { /* silent */ }
            }}
            submitLabel="Galaxie eröffnen"
          />
        </div>
      )}
    </div>
  );
}
