import { useState } from "react";
import { Grid, Stack, Title, Group, NumberInput, Button, Badge, ActionIcon, TextInput, Text, Box, SimpleGrid, Center, Tooltip } from "@mantine/core";
import { IconHeart, IconShield, IconSword, IconRun, IconEye, IconMinus, IconSkull, IconBolt, IconWand, IconActivity, IconShieldCheck, IconCampfire } from "@tabler/icons-react";
import type { Character } from "@appTypes/Character/Character";
import { useAdminCharacterStore } from "@store/admin/adminCharacterStore";
import { HpRing } from "@features/profile/components/HpRing";
import styles from "./CombatWidget.module.css";

// Reusable component for the top stat tiles
const CombatStatTile = ({ icon: Icon, label, value, onChange }: { icon: React.ElementType, label: string, value: number, onChange: (val: number) => void }) => (
  <div className={styles.statTile}>
    <div className={styles.statLabel}><Icon size={14} /> {label}</div>
    <NumberInput
      value={value}
      onChange={(val) => onChange(Number(val))}
      hideControls
      classNames={{ input: styles.statInput }}
    />
  </div>
);

export function CombatWidget({ character }: { character: Character }) {
  const { updateCharacter, longRestCharacter } = useAdminCharacterStore();
  const [hpChange, setHpChange] = useState<number | "">("");

  const handleHeal = () => {
    if (typeof hpChange !== "number") return;
    const newHp = Math.min(character.maxHitPoints, character.hitPoints + hpChange);
    updateCharacter(character.id!, { hitPoints: newHp });
    setHpChange("");
  };

  const handleDamage = () => {
    if (typeof hpChange !== "number") return;
    const newHp = Math.max(0, character.hitPoints - hpChange);
    updateCharacter(character.id!, { hitPoints: newHp });
    setHpChange("");
  };

  const handleLongRest = () => {
    void longRestCharacter(character.id!);
  };

  const handleStatChange = (stat: keyof Character, value: number) => {
    updateCharacter(character.id!, { [stat]: value });
  };

  const hpPercent = (character.hitPoints / character.maxHitPoints) * 100;
  const hpColor = hpPercent <= 25 ? "red" : hpPercent <= 50 ? "yellow" : "green";

  const renderDeathSaves = (type: 'successes' | 'failures', count: number) => {
    const arr = [1, 2, 3];
    return (
      <Group gap="sm">
        {arr.map(num => (
          <div
            key={num}
            className={`${styles.deathSaveCircle} ${num <= count ? (type === 'successes' ? styles.deathSaveSuccess : styles.deathSaveFailure) : ''}`}
            onClick={() => {
              const newVal = num === count ? num - 1 : num;
              handleStatChange(type === 'successes' ? 'deathSavesSuccesses' : 'deathSavesFailures', newVal);
            }}
          />
        ))}
      </Group>
    );
  };

  return (
    <Stack gap="md">
      {/* Top Header & Actions */}
      <Group justify="space-between" align="center">
        <Title order={5} c="dimmed" tt="uppercase" lts={1}>Combat Stats</Title>
        <Tooltip label="Long Rest (Reset HP & Death Saves)">
          <Button 
            variant="light" 
            color="orange" 
            leftSection={<IconCampfire size={16} />}
            onClick={handleLongRest}
            size="xs"
          >
            Long Rest
          </Button>
        </Tooltip>
      </Group>

      {/* Top Banner: Core Combat Stats */}
      <SimpleGrid cols={{ base: 2, sm: 4, lg: 7 }} spacing="sm">
        <CombatStatTile icon={IconShield} label="AC" value={character.armorClass} onChange={(v) => handleStatChange('armorClass', v)} />
        <CombatStatTile icon={IconSword} label="Initiative" value={character.initiative} onChange={(v) => handleStatChange('initiative', v)} />
        <CombatStatTile icon={IconRun} label="Speed" value={character.speed} onChange={(v) => handleStatChange('speed', v)} />
        <CombatStatTile icon={IconEye} label="Passive Perc." value={character.passivePerception} onChange={(v) => handleStatChange('passivePerception', v)} />
        <CombatStatTile icon={IconBolt} label="Prof. Bonus" value={character.proficiencyBonus} onChange={(v) => handleStatChange('proficiencyBonus', v)} />
        <CombatStatTile icon={IconActivity} label="Spell DC" value={character.spellSaveDc} onChange={(v) => handleStatChange('spellSaveDc', v)} />
        <CombatStatTile icon={IconWand} label="Spell ATK" value={character.spellAttackBonus} onChange={(v) => handleStatChange('spellAttackBonus', v)} />
      </SimpleGrid>

      <Grid gutter="md">
        {/* Left Column: HP & Health Management */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <div className={`${styles.glassPanel}`} style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Title order={5} mb="sm" c="white" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconHeart size={18} color={`var(--mantine-color-${hpColor}-5)`} /> Health
            </Title>

            <Group align="center" justify="center" style={{ flex: 1 }}>
              <HpRing character={character} size={160} />
            </Group>

            {character.temporaryHitPoints > 0 && (
              <Center mb="sm">
                <Badge color="blue" size="md" variant="dot">+{character.temporaryHitPoints} Temp HP</Badge>
              </Center>
            )}

            <Group grow align="flex-end" mt="auto">
              <NumberInput
                placeholder="0"
                value={hpChange}
                onChange={(value) => setHpChange(Number(value))}
                min={0}
                hideControls
                size="sm"
                styles={{
                  input: {
                    backgroundColor: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                    color: "white"
                  }
                }}
              />
              <Button color="red" variant="light" onClick={handleDamage} disabled={!hpChange} size="sm">
                Damage
              </Button>
              <Button color="green" variant="light" onClick={handleHeal} disabled={!hpChange} size="sm">
                Heal
              </Button>
            </Group>
          </div>
        </Grid.Col>

        {/* Right Column: Defenses, Conditions & Death Saves */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="md" style={{ height: '100%' }}>
            
            {/* Defenses Panel */}
            <div className={`${styles.glassPanel}`} style={{ padding: '1.25rem' }}>
              <Title order={5} mb="sm" c="white" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconShieldCheck size={18} /> Damage Defenses
              </Title>
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="xs" fw={700} c="dimmed" w={80}>RESISTANT</Text>
                  {character.resistances && character.resistances.length > 0 ? (
                    character.resistances.map(r => <Badge key={r} color="gray" variant="outline">{r}</Badge>)
                  ) : <Text size="xs" c="dark.3" fs="italic">None</Text>}
                </Group>
                <Group gap="xs">
                  <Text size="xs" fw={700} c="dimmed" w={80}>IMMUNE</Text>
                  {character.immunities && character.immunities.length > 0 ? (
                    character.immunities.map(i => <Badge key={i} color="blue" variant="outline">{i}</Badge>)
                  ) : <Text size="xs" c="dark.3" fs="italic">None</Text>}
                </Group>
                <Group gap="xs">
                  <Text size="xs" fw={700} c="dimmed" w={80}>VULNERABLE</Text>
                  {character.vulnerabilities && character.vulnerabilities.length > 0 ? (
                    character.vulnerabilities.map(v => <Badge key={v} color="red" variant="outline">{v}</Badge>)
                  ) : <Text size="xs" c="dark.3" fs="italic">None</Text>}
                </Group>
              </Stack>
            </div>

            {character.hitPoints === 0 && (
              <div className={`${styles.glassPanel}`} style={{ padding: '1.25rem', borderColor: 'var(--mantine-color-red-8)' }}>
                <Title order={5} mb="sm" c="red" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconSkull size={18} /> Death Saves
                </Title>
                <Grid>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed" fw={700} mb="xs">SUCCESSES</Text>
                    {renderDeathSaves('successes', character.deathSavesSuccesses)}
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed" fw={700} mb="xs">FAILURES</Text>
                    {renderDeathSaves('failures', character.deathSavesFailures)}
                  </Grid.Col>
                </Grid>
              </div>
            )}

            {/* Conditions */}
            <div className={`${styles.glassPanel}`} style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Title order={5} mb="sm" c="white" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Active Conditions
              </Title>
              <Box mb="md" style={{ flex: 1 }}>
                <Group gap="xs">
                  {character.conditions && character.conditions.length > 0 ? (
                    character.conditions.map(cond => (
                      <Badge
                        key={cond}
                        color="red"
                        variant="filled"
                        size="md"
                        style={{ paddingRight: 4 }}
                        rightSection={
                          <ActionIcon size="xs" color="white" variant="transparent" onClick={() => {
                            const newConds = character.conditions.filter(c => c !== cond);
                            updateCharacter(character.id!, { conditions: newConds });
                          }}>
                            <IconMinus size={10} />
                          </ActionIcon>
                        }
                      >
                        {cond}
                      </Badge>
                    ))
                  ) : (
                    <Text c="dimmed" size="xs" fs="italic">Character has no conditions.</Text>
                  )}
                </Group>
              </Box>

              <TextInput
                placeholder="Add condition (Enter)"
                size="sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = e.currentTarget.value.trim();
                    if (val && !character.conditions?.includes(val)) {
                      updateCharacter(character.id!, { conditions: [...(character.conditions || []), val] });
                      e.currentTarget.value = '';
                    }
                  }
                }}
                styles={{
                  input: {
                    backgroundColor: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white"
                  }
                }}
              />
            </div>
            
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
