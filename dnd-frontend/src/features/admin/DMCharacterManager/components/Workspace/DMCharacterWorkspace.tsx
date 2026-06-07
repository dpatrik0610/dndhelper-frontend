import { Tabs, Group, Avatar, Title, Badge, ActionIcon, Tooltip } from "@mantine/core";
import { IconSword, IconChartBar, IconMessageCircle, IconCoins, IconLink, IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useCharacterCoreActions } from "@store/character/characterSelectors";
import type { Character } from "@appTypes/Character/Character";
import { CombatWidget } from "./widgets/CombatWidget";
import { StatsWidget } from "./widgets/StatsWidget";
import { RoleplayWidget } from "./widgets/RoleplayWidget";
import { ResourceWidget } from "./widgets/ResourceWidget";
import styles from "@features/admin/DMCharacterManager/DMCharacterDashboard.module.css";

interface DMCharacterWorkspaceProps {
  character: Character;
  onClose: () => void;
}

export function DMCharacterWorkspace({ character, onClose }: DMCharacterWorkspaceProps) {
  const navigate = useNavigate();
  const { setCharacter } = useCharacterCoreActions();

  const handleOpenFullSheet = () => {
    setCharacter(character);
    navigate("/profile");
  };

  return (
    <div className={styles.workspacePanel}>
      <div className={styles.workspaceHeader}>
        <Group wrap="nowrap" gap="md" style={{ flex: 1 }}>
          <Avatar src={character.imageUrl} size="lg" radius="md">
            {character.name.charAt(0)}
          </Avatar>
          <div>
            <Group gap="xs" align="center">
              <Title order={3} c="white">{character.name}</Title>
              {character.isDead && <Badge color="dark" variant="filled">DEAD</Badge>}
              {character.isNPC && <Badge color="blue" variant="filled">NPC</Badge>}
            </Group>
            <Group gap="sm" mt={4}>
              <Badge variant="outline" color="gray" size="sm">Level {character.level} {character.characterClass}</Badge>
              <Badge variant="outline" color="gray" size="sm">{character.race}</Badge>
            </Group>
          </div>
        </Group>

        <Group gap="xs">
          <Tooltip label="Open Full Sheet">
            <ActionIcon 
              variant="subtle" 
              color="gray" 
              onClick={handleOpenFullSheet}
            >
              <IconLink size={20} />
            </ActionIcon>
          </Tooltip>
          <ActionIcon 
            variant="subtle" 
            color="gray" 
            onClick={onClose}
          >
            <IconX size={20} />
          </ActionIcon>
        </Group>
      </div>

      <div className={styles.workspaceBody} style={{ padding: 0 }}>
        <Tabs defaultValue="combat" classNames={{ list: styles.tabsList, tab: styles.tab }}>
          <Tabs.List>
            <Tabs.Tab value="combat" leftSection={<IconSword size={16} />}>Combat</Tabs.Tab>
            <Tabs.Tab value="stats" leftSection={<IconChartBar size={16} />}>Stats & Skills</Tabs.Tab>
            <Tabs.Tab value="roleplay" leftSection={<IconMessageCircle size={16} />}>Roleplay</Tabs.Tab>
            <Tabs.Tab value="resources" leftSection={<IconCoins size={16} />}>Resources</Tabs.Tab>
          </Tabs.List>

          <div style={{ padding: '1rem', height: 'calc(100% - 40px)', overflowY: 'auto' }}>
            <Tabs.Panel value="combat">
              <CombatWidget character={character} />
            </Tabs.Panel>

            <Tabs.Panel value="stats">
              <StatsWidget character={character} />
            </Tabs.Panel>

            <Tabs.Panel value="roleplay">
              <RoleplayWidget character={character} />
            </Tabs.Panel>

            <Tabs.Panel value="resources">
              <ResourceWidget character={character} />
            </Tabs.Panel>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
