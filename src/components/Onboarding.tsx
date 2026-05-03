import { useState } from "react";
import { ProfileEditor } from "./ProfileEditor";
import { useProfileContext } from "../lib/profile-context";

export function Onboarding() {
  const { saveProfile } = useProfileContext();
  const [step, setStep] = useState<"welcome" | "profile">("welcome");
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="onboarding">
      {step === "welcome" && (
        <div className="onboarding-screen welcome-screen">
          <p className="onboarding-kicker">Willkommen</p>
          <h1>Eine kleine Galaxie für jeden ausgefallenen Milchzahn.</h1>
          <p className="onboarding-lede">
            Milky ist ein Tagebuch für die Wackelzahn-Zeit. Mit jedem Zahn, den ihr festhaltet,
            leuchtet ein Stern mehr — bis am Ende eine ganze kleine Konstellation entstanden ist.
          </p>
          <button type="button" className="btn btn-primary btn-large" onClick={() => setStep("profile")}>
            Los geht's
          </button>
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
            }}
            submitLabel="Galaxie eröffnen"
          />
        </div>
      )}
    </div>
  );
}
