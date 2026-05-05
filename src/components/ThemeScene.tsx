import { useProfileContext } from "../lib/profile-context";
import type { ThemeKey } from "../types";

/**
 * Theme-spezifische Hintergrund-Szene.
 * Liegt über .sky-bg und unter dem Inhalt. Reines SVG/CSS — keine externen Assets.
 */
export function ThemeScene() {
  const { activeProfile } = useProfileContext();
  const theme: ThemeKey = activeProfile?.theme ?? "galaxie";

  return (
    <div className="theme-scene" aria-hidden="true">
      {theme === "galaxie" && <GalaxyScene />}
      {theme === "korallenriff" && <ReefScene />}
      {theme === "drachenwald" && <DragonForestScene />}
      {theme === "wolkenreich" && <CloudKingdomScene />}
    </div>
  );
}

/* ============ Galaxie ============ */
function GalaxyScene() {
  return (
    <>
      <div className="scene-stars-extra" />
      <div className="bg-shooting-star ss-1" />
      <div className="bg-shooting-star ss-2" />
      <div className="bg-shooting-star ss-3" />
    </>
  );
}

/* ============ Korallenriff ============ */
function ReefScene() {
  return (
    <>
      <svg className="reef-floor" viewBox="0 0 1200 280" preserveAspectRatio="none">
        <defs>
          <linearGradient id="reefShadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(8, 38, 50, 0)" />
            <stop offset="100%" stopColor="rgba(8, 38, 50, 0.85)" />
          </linearGradient>
          <linearGradient id="anemoneA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 130, 150, 0.65)" />
            <stop offset="100%" stopColor="rgba(180, 60, 90, 0.85)" />
          </linearGradient>
          <linearGradient id="anemoneB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 200, 120, 0.6)" />
            <stop offset="100%" stopColor="rgba(200, 110, 60, 0.8)" />
          </linearGradient>
          <linearGradient id="coralA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 160, 130, 0.55)" />
            <stop offset="100%" stopColor="rgba(160, 70, 60, 0.85)" />
          </linearGradient>
        </defs>
        {/* Sandboden */}
        <path d="M0,200 C200,180 400,210 600,195 C800,180 1000,205 1200,190 L1200,280 L0,280 Z" fill="url(#reefShadow)" />
        {/* Verzweigte Koralle links */}
        <g transform="translate(80, 160)">
          <path d="M0,40 C-6,20 -12,-10 -8,-30 M0,40 C6,18 18,-2 22,-22 M0,40 C-2,8 6,-12 14,-26 M0,40 C-14,20 -22,4 -28,-12"
            stroke="url(#coralA)" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
        {/* Anemone Mitte-links */}
        <g transform="translate(280, 200) scale(1.1)" className="anemone-tendrils">
          <path d="M-18,0 Q-22,-28 -16,-48" stroke="url(#anemoneA)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M-10,0 Q-12,-30 -6,-52" stroke="url(#anemoneA)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M-2,0 Q-2,-32 2,-56" stroke="url(#anemoneA)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M6,0 Q10,-30 14,-50" stroke="url(#anemoneA)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M14,0 Q20,-26 22,-46" stroke="url(#anemoneA)" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
        {/* Buschige Koralle Mitte */}
        <g transform="translate(560, 170)">
          <path d="M0,40 C-4,15 -10,-10 -14,-30 M0,40 C2,18 4,-6 4,-26 M0,40 C8,20 16,2 20,-18 M0,40 C-12,18 -20,-2 -22,-22"
            stroke="url(#coralA)" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="-14" cy="-30" r="4" fill="rgba(255,180,160,0.55)" />
          <circle cx="20" cy="-18" r="3.5" fill="rgba(255,180,160,0.55)" />
          <circle cx="4" cy="-26" r="3" fill="rgba(255,180,160,0.55)" />
        </g>
        {/* Anemone Mitte-rechts */}
        <g transform="translate(820, 198) scale(1.25)" className="anemone-tendrils slow">
          <path d="M-16,0 Q-20,-30 -14,-50" stroke="url(#anemoneB)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M-8,0 Q-10,-32 -4,-54" stroke="url(#anemoneB)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M0,0 Q0,-34 4,-58" stroke="url(#anemoneB)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M8,0 Q12,-32 16,-52" stroke="url(#anemoneB)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M16,0 Q22,-28 24,-48" stroke="url(#anemoneB)" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
        {/* Verzweigte Koralle rechts */}
        <g transform="translate(1080, 165)">
          <path d="M0,40 C-8,18 -16,-6 -22,-26 M0,40 C0,16 6,-8 12,-28 M0,40 C-4,12 4,-14 14,-32 M0,40 C12,20 22,2 28,-18"
            stroke="url(#coralA)" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
      </svg>
      {/* Aufsteigende Luftblasen */}
      <div className="bubbles">
        <span className="bubble b1" />
        <span className="bubble b2" />
        <span className="bubble b3" />
        <span className="bubble b4" />
        <span className="bubble b5" />
        <span className="bubble b6" />
        <span className="bubble b7" />
      </div>
    </>
  );
}

/* ============ Drachenwald ============ */
function DragonForestScene() {
  return (
    <>
      <svg className="forest-trees" viewBox="0 0 1200 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="treeFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(20, 50, 38, 0.55)" />
            <stop offset="100%" stopColor="rgba(10, 30, 22, 0.95)" />
          </linearGradient>
          <linearGradient id="treeNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(8, 28, 20, 0.85)" />
            <stop offset="100%" stopColor="rgba(4, 14, 10, 1)" />
          </linearGradient>
          <linearGradient id="trunkFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(35, 22, 14, 0.75)" />
            <stop offset="100%" stopColor="rgba(18, 12, 8, 0.95)" />
          </linearGradient>
          <linearGradient id="trunkNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(28, 18, 10, 0.95)" />
            <stop offset="100%" stopColor="rgba(8, 6, 4, 1)" />
          </linearGradient>
        </defs>

        {/* Hintere, kleinere Baumreihe */}
        {[20, 100, 170, 245, 320, 400, 480, 555, 630, 710, 790, 870, 950, 1030, 1110, 1185].map((x, i) => (
          <FirTree key={`far-${i}`} x={x} groundY={260} scale={0.85 + (i % 3) * 0.08} variant="far" />
        ))}

        {/* Vordere, größere Baumreihe */}
        {[-10, 80, 170, 265, 355, 450, 545, 640, 735, 830, 925, 1015, 1105, 1200].map((x, i) => (
          <FirTree key={`near-${i}`} x={x} groundY={320} scale={1.0 + (i % 4) * 0.1} variant="near" />
        ))}
      </svg>
      {/* Funken zwischen den Bäumen */}
      <div className="forest-sparks">
        <span className="spark sp1" />
        <span className="spark sp2" />
        <span className="spark sp3" />
        <span className="spark sp4" />
        <span className="spark sp5" />
      </div>
      {/* Drachen-Silhouette die ab und zu vorbeizieht */}
      <div className="dragon-flight">
        <svg className="dragon" viewBox="0 0 220 110">
          <g fill="rgba(8, 18, 14, 0.92)">
            {/* Geschwungener Schwanz (von links nach Körper) */}
            <path d="M6,68 Q30,72 55,66 Q80,60 105,62 L105,72 Q80,70 58,76 Q34,82 12,76 Z" />
            {/* Schwanz-Spitze (Pfeilform) */}
            <path d="M0,72 L18,66 L20,72 L18,78 Z" />
            {/* Schwanz-Stachel/Flosse (kleines Dreieck oben am Schwanzansatz) */}
            <path d="M48,60 L52,48 L60,62 Z" />

            {/* Körper (eiförmig, leicht gestreckt) */}
            <ellipse cx="125" cy="68" rx="32" ry="16" />

            {/* Vier Beine (kurz, mit Krallen-Andeutung) */}
            <path d="M108,82 L106,96 L102,98 L102,93 L98,98 L98,92 Z" />
            <path d="M118,84 L116,98 L112,100 L112,95 L108,100 L108,94 Z" />
            <path d="M138,84 L140,98 L144,100 L144,95 L148,100 L148,94 Z" />
            <path d="M148,82 L150,96 L154,98 L154,93 L158,98 L158,92 Z" />

            {/* Hals (geschwungen, hebt sich) */}
            <path d="M152,62 Q170,52 178,46 L184,52 Q176,58 158,68 Z" />

            {/* Kopf (stilisiert, mit Schnauze) */}
            <path d="M178,40 Q198,38 208,46 Q210,54 202,58 L188,56 Q180,52 178,46 Z" />
            {/* Schnauze (spitzer hervorstehend) */}
            <path d="M204,48 L218,46 L216,52 L204,54 Z" />
            {/* Nasenloch */}
            <circle cx="212" cy="49" r="0.9" fill="rgba(255,180,80,0.8)" />

            {/* Hörner (zwei nach hinten geschwungen) */}
            <path d="M186,40 Q186,28 178,22 L180,30 Q184,36 188,42 Z" />
            <path d="M192,40 Q194,28 188,18 L190,28 Q194,36 196,42 Z" />

            {/* Auge — leuchtend */}
            <circle cx="194" cy="48" r="1.8" fill="rgba(255, 200, 80, 0.95)" />
            <circle cx="194" cy="48" r="0.7" fill="rgba(20, 10, 0, 1)" />

            {/* Kinn-Spitze / kleiner Bart */}
            <path d="M184,54 L182,62 L188,58 Z" />

            {/* Rückenstacheln (ein paar kleine Dreiecke entlang des Rückens) */}
            <path d="M100,56 L104,48 L108,56 Z" />
            <path d="M115,52 L120,42 L125,52 Z" />
            <path d="M132,52 L137,42 L142,52 Z" />
            <path d="M148,54 L152,46 L156,56 Z" />

            {/* Flügel — obere Phase (gespreizt nach oben) */}
            <g className="dragon-wing-up">
              <path d="M115,60 Q105,18 130,8 Q150,12 158,28 Q150,32 142,42 Q132,50 122,58 Z" />
              {/* Flügel-Adern */}
              <path d="M118,58 Q125,38 132,16" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" fill="none" />
              <path d="M125,56 Q132,38 142,22" stroke="rgba(0,0,0,0.4)" strokeWidth="1" fill="none" />
              <path d="M132,52 Q142,40 152,30" stroke="rgba(0,0,0,0.4)" strokeWidth="1" fill="none" />
            </g>

            {/* Flügel — untere Phase (heruntergezogen) */}
            <g className="dragon-wing-down" opacity="0">
              <path d="M115,76 Q105,108 130,104 Q150,100 158,90 Q150,86 142,82 Q132,80 122,78 Z" />
              <path d="M118,78 Q125,92 132,102" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" fill="none" />
              <path d="M125,80 Q132,92 142,100" stroke="rgba(0,0,0,0.4)" strokeWidth="1" fill="none" />
              <path d="M132,82 Q142,90 152,96" stroke="rgba(0,0,0,0.4)" strokeWidth="1" fill="none" />
            </g>
          </g>
        </svg>
      </div>
    </>
  );
}

/* ============ Wolkenreich ============ */
function CloudKingdomScene() {
  return (
    <>
      <div className="clouds">
        <Cloud className="cloud c1" />
        <Cloud className="cloud c2" />
        <Cloud className="cloud c3" />
        <Cloud className="cloud c4" />
        <Cloud className="cloud c5" />
        <Cloud className="cloud c6" />
      </div>
    </>
  );
}

/**
 * Eine stilisierte Tanne. Stamm + 4 sich verjüngende Etagen.
 * Pivot ist (x, groundY): unten zentriert auf dem Boden.
 */
function FirTree({
  x,
  groundY,
  scale = 1,
  variant,
}: {
  x: number;
  groundY: number;
  scale?: number;
  variant: "far" | "near";
}) {
  const fill = variant === "far" ? "url(#treeFar)" : "url(#treeNear)";
  const trunk = variant === "far" ? "url(#trunkFar)" : "url(#trunkNear)";

  if (variant === "far") {
    // Kleinere Tanne (max Höhe 130 vor Skalierung)
    return (
      <g transform={`translate(${x}, ${groundY}) scale(${scale})`}>
        <rect x="-3" y="-22" width="6" height="22" fill={trunk} />
        <polygon points="-30,-22 0,-58 30,-22" fill={fill} />
        <polygon points="-24,-50 0,-86 24,-50" fill={fill} />
        <polygon points="-18,-78 0,-112 18,-78" fill={fill} />
        <polygon points="-12,-104 0,-130 12,-104" fill={fill} />
      </g>
    );
  }
  // Größere Tanne (max Höhe 180 vor Skalierung)
  return (
    <g transform={`translate(${x}, ${groundY}) scale(${scale})`}>
      <rect x="-5" y="-30" width="10" height="30" fill={trunk} />
      <polygon points="-40,-30 0,-78 40,-30" fill={fill} />
      <polygon points="-32,-66 0,-114 32,-66" fill={fill} />
      <polygon points="-24,-100 0,-148 24,-100" fill={fill} />
      <polygon points="-16,-132 0,-180 16,-132" fill={fill} />
    </g>
  );
}

function Cloud({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 200 80">
      <defs>
        <radialGradient id="cloudFill" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
          <stop offset="60%" stopColor="rgba(255, 240, 250, 0.7)" />
          <stop offset="100%" stopColor="rgba(255, 220, 240, 0)" />
        </radialGradient>
      </defs>
      <g fill="url(#cloudFill)">
        <ellipse cx="50" cy="48" rx="46" ry="22" />
        <ellipse cx="100" cy="40" rx="56" ry="28" />
        <ellipse cx="150" cy="50" rx="42" ry="20" />
        <ellipse cx="80" cy="34" rx="32" ry="18" />
        <ellipse cx="130" cy="32" rx="28" ry="16" />
      </g>
    </svg>
  );
}
