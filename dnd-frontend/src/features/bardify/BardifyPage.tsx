import { useEffect, useState } from "react";
import { useCanDriveMusic, useCurrentCampaign } from "@store/campaign/campaignSelectors";
import { useMusicStore } from "@store/music/musicStore";
import MusicTab from "./MusicTab";
import AmbienceTab from "./AmbienceTab";
import FetchTab from "./FetchTab";
import { message } from "./lib";
import { Icon, type IconName } from "./icons";
import "./bardify.css";

const TABS: { id: "music" | "ambience" | "fetch"; label: string; icon: IconName; title: string; note: string; tone: "gold" | "teal" }[] = [
  { id: "music", label: "Music", icon: "note", title: "The Songbook", note: "What you play here starts for everyone listening, on the same beat.", tone: "gold" },
  { id: "ambience", label: "Ambience", icon: "waves", title: "The Soundscape", note: "Loops that play under the music. One set sounds at a time, and every change eases in.", tone: "teal" },
  { id: "fetch", label: "SpotFetcher", icon: "fetch", title: "Summon Songs", note: "Paste a Spotify link. Each song is matched, downloaded with its tags and cover, and lands in Unsorted.", tone: "gold" },
];
type Tab = (typeof TABS)[number]["id"];

export default function BardifyPage() {
  const campaign = useCurrentCampaign();
  const canDrive = useCanDriveMusic();
  const campaignId = useMusicStore((s) => s.campaignId);
  const lib = useMusicStore((s) => s.library);
  const loadLibrary = useMusicStore((s) => s.loadLibrary);
  const sounding = useMusicStore((s) => (s.state?.playing && s.state.track ? "music" : s.state?.ambience ? "ambience" : null));
  const [tab, setTab] = useState<Tab>("music");
  const [error, setError] = useState<string | null>(null);
  const current = TABS.find((t) => t.id === tab)!;

  useEffect(() => {
    if (!campaignId || !canDrive) return;
    loadLibrary().catch((err) => setError(message(err)));
  }, [campaignId, canDrive, loadLibrary]);

  if (!campaign || !canDrive) {
    return (
      <div className="bardify">
        <div className="sb-wrap">
          <p className="sb-meta sb-wait">{campaign ? "Only the campaign’s bard or DM plays the music." : "Choose a campaign first."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bardify">
      <div className="sb-wrap">
        <header className="sb-header">
          <div className="sb-header-text">
            <span className="sb-eyebrow">Bardify · {campaign.name}</span>
            <h1 className="sb-h1">{current.title}</h1>
            <p className="sb-sub">{current.note}</p>
          </div>
          <div className="sb-header-side">
            {sounding && (
              <span className="sb-pill">
                <span className="sb-dot" /> {sounding === "music" ? "Playing for the table" : "Ambience for the table"}
              </span>
            )}
            <div className="sb-tabs" role="tablist" aria-label="Bardify">
              {TABS.map((t) => (
                <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`sb-tab-btn is-${t.tone} ${tab === t.id ? "is-on" : ""}`} onClick={() => setTab(t.id)}>
                  <Icon name={t.icon} size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </header>
        {error && !lib && <p className="sb-error">{error}</p>}
        {!lib ? (
          !error && <p className="sb-meta sb-wait">Tuning up…</p>
        ) : (
          <>
            <div hidden={tab !== "music"}>
              <MusicTab lib={lib} />
            </div>
            <div hidden={tab !== "ambience"}>
              <AmbienceTab lib={lib} />
            </div>
          </>
        )}
        <div hidden={tab !== "fetch"}>
          <FetchTab active={tab === "fetch"} onOpenLibrary={() => setTab("music")} />
        </div>
        <p className="sb-credit">
          Bardify &amp; SpotFetcher by{" "}
          <a href="https://github.com/BMNHunter" target="_blank" rel="noopener noreferrer">
            Shiro
          </a>
        </p>
      </div>
    </div>
  );
}
