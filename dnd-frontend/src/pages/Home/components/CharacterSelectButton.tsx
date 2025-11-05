import { Group, Text, Box, Button } from "@mantine/core"
import { IconUser } from "@tabler/icons-react"

export interface CharacterSelectButtonProps {
    setModalOpened: (value: React.SetStateAction<boolean>) => void
}
export function CharacterSelectButton({setModalOpened}: CharacterSelectButtonProps) {

    {/* === Floating Character Button === */}
    return (
      <Box
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 999,
        }}
      >
        <Button
          color="transparent"
          onClick={() => setModalOpened(true)}
          size="md"
          radius="xl"
          style={{
            background: "rgba(0,0,0,0.25)",
            boxShadow: "0 4px 10px rgba(0,0,0,0.47)",
            border: "1px solid rgba(0,0,0,0.23)",
            transition: "all 0.3s ease",
          }}
        >
          <Group lts="xs">
            <IconUser size={20} />
            <Text fw={500}>Characters</Text>
          </Group>
        </Button>
      </Box>

    )
}