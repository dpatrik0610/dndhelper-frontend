import { useState } from "react";
import { Autocomplete, Select, Group, Box } from "@mantine/core";
import { useSpellStore } from "@store/useSpellStore";
import { loadCurrentSpell } from "@utils/loadSpells";
import { useAuthStore } from "@store/useAuthStore";
import { IconWand, IconFilter } from "@tabler/icons-react";

export function SpellSelect() {
  const { spellNames } = useSpellStore();
  const token = useAuthStore.getState().token;
  const [inputValue, setInputValue] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // Get unique levels and format them
  const levelOptions = Array.from(new Set(spellNames.map(s => s.level)))
    .sort((a, b) => a - b)
    .map(level => ({
      value: level.toString(),
      label: level === 0 ? 'Cantrip' : `Level ${level}`
    }));

  // Filter spell names based on selected level
  const filteredSpellNames = selectedLevel 
    ? spellNames.filter(s => s.level === parseInt(selectedLevel))
    : spellNames;

  const spellNameList = filteredSpellNames.map((s) => s.name);

  const handleSpellChange = async (value: string) => {
    setInputValue(value);
    const selected = spellNames.find((s) => s.name === value);
    if (selected && token) {
      await loadCurrentSpell(selected.id, token);
    }
  };

  const handleLevelChange = (value: string | null) => {
    setSelectedLevel(value);
    setInputValue("");
  };

  return (
    <Group gap="xs" align="flex-end">
      <Box style={{ flex: 1 }}>
        <Autocomplete
          leftSection={<IconWand size={18} />}
          value={inputValue}
          placeholder={selectedLevel ? `Select a ${selectedLevel === '0' ? 'Cantrip' : `Level ${selectedLevel}`} spell...` : "Select a spell..."}
          data={spellNameList}
          onChange={handleSpellChange}
          styles={{
            input: {
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(10px)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            },
            dropdown: {
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            },
            option: {
              color: "white",
              transition: "background 120ms ease",
            },
          }}
        />
      </Box>
      
      <Select
        leftSection={<IconFilter size={16} />}
        placeholder="Filter by level"
        value={selectedLevel}
        onChange={handleLevelChange}
        data={levelOptions}
        clearable
        style={{ width: 140 }}
        styles={{
          input: {
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(10px)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          },
          dropdown: {
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
          option: {
            color: "white",
            transition: "background 120ms ease",
          },
        }}
      />
    </Group>
  );
}
