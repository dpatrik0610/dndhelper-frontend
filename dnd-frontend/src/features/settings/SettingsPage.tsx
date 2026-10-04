import { Box, Title, Text, Stack, Tabs } from "@mantine/core";
import { IconAdjustments, IconUserCircle } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { useIsMobile } from "@hooks/useIsMobile";
import { InterfaceSettings } from "./tabs/InterfaceSettings";
import { CharacterSettings } from "./tabs/CharacterSettings";
import "@features/profile/styles/CharacterProfile.styles.css";

/** Each tab is its own URL (/settings/<value>), so tabs can be linked and survive reloads. */
const tabs = [
  { value: "interface", label: "Interface", icon: IconAdjustments, panel: InterfaceSettings },
  { value: "characters", label: "Characters", icon: IconUserCircle, panel: CharacterSettings },
];

export default function SettingsPage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { tab } = useParams();
  const active = tabs.find((t) => t.value === tab) ?? tabs[0];

  return (
    <Box
      m="0 auto"
      maw="100%"
      w="100%"
      p={isMobile ? "xs" : "xl"}
      style={{
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      }}
    >
      <Stack gap="xl">
        {/* Page Header */}
        <Box>
          <Title
            order={2}
            style={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontWeight: 700,
              letterSpacing: "1px",
              color: "var(--theme-color-text-primary, #fff)",
            }}
          >
            Settings
          </Title>
          <Text c="dimmed" size="sm" mt="xs">
            Site preferences and your characters. The theme lives in the sidebar.
          </Text>
        </Box>

        <Tabs
          value={active.value}
          onChange={(value) => value && navigate(`/settings/${value}`, { replace: true })}
          variant="pills"
          radius="md"
          keepMounted={false}
          classNames={{ list: "profile-tabs-list", tab: "profile-tab" }}
        >
          <Tabs.List>
            {tabs.map(({ value, label, icon: Icon }) => (
              <Tabs.Tab key={value} value={value} leftSection={<Icon size={16} />}>
                {label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {tabs.map(({ value, panel: Panel }) => (
            <Tabs.Panel key={value} value={value}>
              <Panel />
            </Tabs.Panel>
          ))}
        </Tabs>
      </Stack>
    </Box>
  );
}
