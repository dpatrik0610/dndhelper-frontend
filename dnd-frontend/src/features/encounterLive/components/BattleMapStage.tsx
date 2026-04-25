import { Center, Image, ThemeIcon } from "@mantine/core";
import { IconMap2 } from "@tabler/icons-react";

type BattleMapStageProps = {
  mapUrl: string | null;
  encounterName: string;
  className?: string;
};

export function BattleMapStage({ mapUrl, encounterName, className }: BattleMapStageProps) {
  if (!mapUrl) {
    return (
      <Center className={className}>
        <ThemeIcon size={64} radius="xl" variant="light" color="grape">
          <IconMap2 size={32} />
        </ThemeIcon>
      </Center>
    );
  }

  return <Image src={mapUrl} alt={`${encounterName} map`} fit="contain" className={className} />;
}
