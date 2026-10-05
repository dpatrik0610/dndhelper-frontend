import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Loader, PinInput, Text, UnstyledButton } from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBell,
  IconCheck,
  IconCloudFog,
  IconDice5,
  IconHexagons,
  IconSparkles,
  IconSwords,
  IconUsers,
} from "@tabler/icons-react";
import { getAllCampaigns } from "@services/campaignService";
import { useCurrentUserId, useIsSuperAdmin } from "@store/auth/authSelectors";
import { useTabletopStore } from "@store/tabletop/tabletopStore";
import type { Campaign } from "@appTypes/Campaign";
import { tabletop } from "./useTabletopHub";

const CODE_LENGTH = 6;

const FEATURES = [
  { icon: IconHexagons, title: "Square & hex grids", text: "Tokens snap, move and measure in real time." },
  { icon: IconDice5, title: "Initiative & dice", text: "Turn order, HP, effects and server-side rolls." },
  { icon: IconCloudFog, title: "Fog & layers", text: "Reveal the map as the party explores." },
  { icon: IconSparkles, title: "Spell effects", text: "Templates and animated effects in any colour." },
];

/** /table: join with a code, or (as a DM) open one of your campaign tables. */
export function TabletopLobby() {
  const navigate = useNavigate();
  const me = useCurrentUserId();
  const isAdmin = useIsSuperAdmin();
  const connected = useTabletopStore((s) => s.connected);
  const joinError = useTabletopStore((s) => s.joinError);
  const [code, setCode] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    let active = true;
    getAllCampaigns()
      .then((list) => {
        if (!active) return;
        const mine = (list ?? []).filter((c) => !c.isDeleted && (isAdmin || (me && c.ownerIds?.includes(me))));
        setCampaigns(mine);
        if (mine.length === 1) setCampaignId(mine[0].id);
      })
      .catch(() => active && setCampaigns([]));
    return () => {
      active = false;
    };
  }, [isAdmin, me]);

  const join = (value = code) => value.length === CODE_LENGTH && navigate(`/table/${value}`);

  const open = async () => {
    if (!campaignId) return;
    setOpening(true);
    const tableCode = await tabletop.openForCampaign(campaignId);
    setOpening(false);
    if (tableCode) navigate(`/table/${tableCode}`);
  };

  const hosting = !!campaigns?.length;

  return (
    <div className="tt-root tt-lobby">
      <header className="tt-lobby-header">
        <UnstyledButton className="tt-lobby-back" onClick={() => navigate("/home")}>
          <IconArrowLeft size={16} />
          <span>Home</span>
        </UnstyledButton>
        <span className={`tt-lobby-status${connected ? " on" : ""}`}>
          <span className="tt-dot" />
          {connected ? "Server online" : "Connecting…"}
        </span>
      </header>

      <main className="tt-lobby-main">
        <section className="tt-lobby-intro">
          <span className="tt-lobby-eyebrow">
            <IconSwords size={14} /> Virtual tabletop
          </span>
          <h1 className="tt-lobby-title">
            Gather your party.
            <br />
            <span>Roll for initiative.</span>
          </h1>
          <p className="tt-lobby-lead">
            A shared battle map for your campaign. Everyone sees the same board, live. Your character sheet is one tap
            away.
          </p>
          <ul className="tt-lobby-features">
            {FEATURES.map(({ icon: FeatureIcon, title, text }) => (
              <li key={title}>
                <span className="tt-lobby-feature-icon">
                  <FeatureIcon size={18} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="tt-lobby-card tt-glass">
          <div className="tt-lobby-block">
            <h2>Join a table</h2>
            <p>Enter the 6-character room code from your DM.</p>
            <PinInput
              length={CODE_LENGTH}
              type={/^[A-Za-z0-9]*$/}
              value={code}
              onChange={(v) => setCode(v.toUpperCase())}
              onComplete={(v) => join(v.toUpperCase())}
              size="lg"
              gap={8}
              aria-label="Room code"
              classNames={{ root: "tt-pin", pinInput: "tt-pin-cell", input: "tt-pin-input" }}
              autoFocus
            />
            {joinError && (
              <Text size="xs" c="red.4" mt={6}>
                {joinError}
              </Text>
            )}
            <Button
              fullWidth
              size="md"
              mt="md"
              rightSection={<IconArrowRight size={16} />}
              disabled={code.length !== CODE_LENGTH}
              onClick={() => join()}
            >
              Join table
            </Button>
            <p className="tt-lobby-hint">
              <IconBell size={13} /> Or wait for your DM's invite: the notification opens the table for you.
            </p>
          </div>

          {campaigns === null ? (
            <div className="tt-lobby-block tt-lobby-loading">
              <Loader size="sm" color="violet" />
            </div>
          ) : (
            hosting && (
              <div className="tt-lobby-block">
                <div className="tt-lobby-divider">
                  <span>Dungeon Master</span>
                </div>
                <h2>Host a table</h2>
                <p>Open the table for one of your campaigns. It keeps the map, tokens and fog between sessions.</p>
                <div className="tt-lobby-campaigns" role="radiogroup" aria-label="Campaign">
                  {campaigns.map((c) => {
                    const selected = c.id === campaignId;
                    return (
                      <UnstyledButton
                        key={c.id}
                        role="radio"
                        aria-checked={selected}
                        className={`tt-lobby-campaign${selected ? " selected" : ""}`}
                        onClick={() => setCampaignId(c.id)}
                      >
                        <span className="tt-lobby-campaign-mark">{c.name.slice(0, 1).toUpperCase()}</span>
                        <span className="tt-lobby-campaign-text">
                          <strong>{c.name}</strong>
                          <span>
                            <IconUsers size={12} /> {c.characterIds?.length ?? 0} characters
                          </span>
                        </span>
                        {selected && <IconCheck size={16} className="tt-lobby-campaign-check" />}
                      </UnstyledButton>
                    );
                  })}
                </div>
                <Button
                  fullWidth
                  size="md"
                  variant="light"
                  mt="md"
                  loading={opening}
                  disabled={!campaignId || !connected}
                  onClick={open}
                >
                  Open campaign table
                </Button>
              </div>
            )
          )}
        </section>
      </main>
    </div>
  );
}
