import {
  Modal,
  Avatar,
  Badge,
  Group,
  Text,
  ScrollArea,
  Title,
  Button,
  SimpleGrid,
  Stack,
} from "@mantine/core";
import { IconPlus, IconUserCircle } from "@tabler/icons-react";
import { useState } from "react";
import type { Character } from "@appTypes/Character/Character";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mantine/hooks";
import classes from "./styles/CharacterSelectModal.module.css";

interface CharacterSelectModalProps {
  opened: boolean;
  onClose: () => void;
  characters: Character[];
  onSelect: (character: Character) => void;
}

export function CharacterSelectModal({
  opened,
  onClose,
  characters,
  onSelect,
}: CharacterSelectModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 50em)");

  const handleSelect = (char: Character) => {
    setSelected(char.id ?? null);
    // slight delay to show the selected visual state
    setTimeout(() => {
      onSelect(char);
      onClose();
      setSelected(null);
    }, 150);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
      fullScreen={isMobile}
      title={
        <Group gap={10}>
          <Title order={3} c="white" bg="transparent">
            Choose Your Character
          </Title>
        </Group>
      }
      overlayProps={{ blur: 12, backgroundOpacity: 0.4 }}
      classNames={{
        content: classes.content,
        header: classes.header,
        title: classes.title,
        close: classes.close,
        body: classes.body,
      }}
      transitionProps={{ transition: "pop" }}
    >
      <ScrollArea h={isMobile ? "calc(100vh - 140px)" : 450} type="scroll" offsetScrollbars>
        {characters.length === 0 ? (
          <Stack align="center" justify="center" h={300} gap="md">
            <IconUserCircle size={64} style={{ opacity: 0.3 }} />
            <Text c="dimmed" size="lg">No characters found</Text>
          </Stack>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" pb="md">
            {characters.map((char) => (
              <div
                key={char.id}
                className={`${classes.card} ${selected === char.id ? classes.cardSelected : ""}`}
                onClick={() => handleSelect(char)}
              >
                <Group wrap="nowrap" align="center">
                  <Avatar radius="md" size={64} className={classes.avatar}>
                    {char.name.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text fw={700} size="xl" c="white" truncate style={{ letterSpacing: '0.3px', fontSize: '1.25rem' }}>
                      {char.name}
                    </Text>
                    <Group gap="xs" mt={8} wrap="wrap">
                      <Badge 
                        radius="sm" 
                        size="md" 
                        variant="filled"
                        className={`${classes.detailBadge} ${classes.levelBadge}`}
                      >
                        Lvl {char.level}
                      </Badge>
                      <Badge 
                        radius="sm" 
                        size="md" 
                        variant="filled"
                        className={classes.detailBadge}
                      >
                        {char.race}
                      </Badge>
                      {char.characterClass && (
                        <Badge 
                          radius="sm" 
                          size="md" 
                          variant="filled"
                          className={classes.detailBadge}
                        >
                          {char.characterClass}
                        </Badge>
                      )}
                    </Group>
                  </div>
                </Group>
              </div>
            ))}
          </SimpleGrid>
        )}
      </ScrollArea>
      
      <Group justify="flex-end" mt="md" pt="md" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <Button 
          className={classes.newButton}
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate("/newCharacter")}
          size="md"
          radius="md"
        >
          New Character
        </Button>
      </Group>
    </Modal>
  );
}

