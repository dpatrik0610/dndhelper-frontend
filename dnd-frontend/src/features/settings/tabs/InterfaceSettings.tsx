import { Button, Divider, Group, SegmentedControl, Select, Stack, Switch } from "@mantine/core";
import { IconAdjustments, IconBolt, IconMessageCircle, IconRestore } from "@tabler/icons-react";
import { useUiStore, type NotificationPosition, type SitePrefs } from "@store/ui/uiStore";
import { SettingRow, SettingsSection } from "@features/settings/SettingsSection";

const scaleOptions = [
  { value: "90", label: "Small" },
  { value: "100", label: "Default" },
  { value: "110", label: "Large" },
  { value: "120", label: "Larger" },
];

const positionOptions: { value: NotificationPosition; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
];

const accent = "var(--theme-color-accent-primary, #f59e0b)";
const divider = <Divider color="var(--theme-border-subtle, rgba(255, 255, 255, 0.06))" />;

type BooleanPref = { [K in keyof SitePrefs]: SitePrefs[K] extends boolean ? K : never }[keyof SitePrefs];

interface PrefSwitchProps {
  pref: BooleanPref;
  label: string;
  description: string;
  /** Shown off and locked, e.g. when another setting already overrides this one. */
  forcedOff?: boolean;
}

function PrefSwitch({ pref, label, description, forcedOff = false }: PrefSwitchProps) {
  const value = useUiStore((s) => s.prefs[pref]);
  const setPref = useUiStore((s) => s.setPref);

  return (
    <SettingRow label={label} description={description}>
      <Switch
        color={accent}
        checked={value && !forcedOff}
        disabled={forcedOff}
        onChange={(e) => setPref(pref, e.currentTarget.checked)}
        aria-label={label}
      />
    </SettingRow>
  );
}

export function InterfaceSettings() {
  const prefs = useUiStore((s) => s.prefs);
  const setPref = useUiStore((s) => s.setPref);
  const resetPrefs = useUiStore((s) => s.resetPrefs);

  return (
    <Stack gap="xl">
      <SettingsSection
        icon={<IconAdjustments size={20} color={accent} />}
        title="Display"
        description="How the site looks on this account. Changes apply instantly and follow you to other devices."
      >
        <Stack gap={0}>
          <SettingRow label="Text size" description="Scales text and spacing across the site.">
            <SegmentedControl
              size="xs"
              data={scaleOptions}
              value={String(prefs.uiScale)}
              onChange={(v) => setPref("uiScale", Number(v))}
            />
          </SettingRow>
          {divider}

          <SettingRow label="Notification position" description="Corner where pop-up messages appear.">
            <Select
              size="xs"
              w={150}
              data={positionOptions}
              value={prefs.notificationPosition}
              onChange={(v) => v && setPref("notificationPosition", v as NotificationPosition)}
              allowDeselect={false}
              aria-label="Notification position"
            />
          </SettingRow>
          {divider}

          <PrefSwitch
            pref="floatingChat"
            label="Chat bubble"
            description="Your campaign chat in a bubble at the bottom right. The tabletop always has its own chat tab."
          />
        </Stack>
      </SettingsSection>

      <SettingsSection
        icon={<IconBolt size={20} color={accent} />}
        title="Motion & performance"
        description="Tone down animations and effects. Your system's reduced-motion setting is always respected."
      >
        <Stack gap={0}>
          <PrefSwitch
            pref="reduceMotion"
            label="Reduce motion"
            description="Stops animations and transitions across the site."
          />
          {divider}

          <PrefSwitch
            pref="performanceMode"
            label="Performance mode"
            description="Turns off glass blur and the animated background. Try this if the site feels sluggish."
          />
          {divider}

          <PrefSwitch
            pref="animatedBackground"
            label="Animated background"
            description={
              prefs.reduceMotion || prefs.performanceMode
                ? "Off while reduce motion or performance mode is on."
                : "Moving theme scenery. Phones always use the still version."
            }
            forcedOff={prefs.reduceMotion || prefs.performanceMode}
          />
          {divider}

          <PrefSwitch
            pref="diceAnimation"
            label="Dice animation"
            description={
              prefs.reduceMotion
                ? "Off while reduce motion is on."
                : "Tumble and count-up when rolling. Off shows results immediately."
            }
            forcedOff={prefs.reduceMotion}
          />
        </Stack>
      </SettingsSection>

      <SettingsSection
        icon={<IconMessageCircle size={20} color={accent} />}
        title="Chat & tabletop"
        description="Sounds and helpers for playing at the table."
      >
        <Stack gap={0}>
          <PrefSwitch
            pref="chatSound"
            label="Chat sound"
            description="A soft chime when someone else writes in the campaign chat."
          />
          {divider}

          <PrefSwitch
            pref="tabletopMinimap"
            label="Tabletop minimap"
            description="An overview of the whole board in a corner of the tabletop. Drag it by its top edge to move it."
          />
        </Stack>
      </SettingsSection>

      <Group justify="flex-end">
        <Button size="xs" variant="subtle" color="gray" leftSection={<IconRestore size={14} />} onClick={resetPrefs}>
          Reset to defaults
        </Button>
      </Group>
    </Stack>
  );
}
