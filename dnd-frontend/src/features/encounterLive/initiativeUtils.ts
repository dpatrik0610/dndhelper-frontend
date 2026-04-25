import type { EncounterEntity } from "@appTypes/Encounter";

export const sortByInitiative = (entities: EncounterEntity[]) =>
  [...entities].sort((left, right) => {
    const leftInitiative = left.initiative ?? Number.NEGATIVE_INFINITY;
    const rightInitiative = right.initiative ?? Number.NEGATIVE_INFINITY;

    if (leftInitiative !== rightInitiative) {
      return rightInitiative - leftInitiative;
    }

    return left.name.localeCompare(right.name);
  });

export const getEntityStatusColor = (status: EncounterEntity["status"]) => {
  switch (status) {
    case "Alive":
      return "green";
    case "Unconscious":
      return "yellow";
    case "Dead":
      return "red";
    case "Fled":
      return "blue";
    case "Removed":
      return "gray";
    default:
      return "grape";
  }
};

export const nextTurnState = (
  sortedEntities: EncounterEntity[],
  activeEntityKey: string | null,
  cycleCount: number,
) => {
  if (sortedEntities.length === 0) {
    return { activeEntityKey: null, cycleCount };
  }

  if (!activeEntityKey) {
    return {
      activeEntityKey: buildEntityKey(sortedEntities[0], 0),
      cycleCount: cycleCount || 1,
    };
  }

  const index = sortedEntities.findIndex((entity, entityIndex) => buildEntityKey(entity, entityIndex) === activeEntityKey);
  const nextIndex = index >= 0 ? (index + 1) % sortedEntities.length : 0;
  const wrapped = index >= 0 && nextIndex === 0;

  return {
    activeEntityKey: buildEntityKey(sortedEntities[nextIndex], nextIndex),
    cycleCount: wrapped ? cycleCount + 1 : cycleCount,
  };
};

export const buildEntityKey = (entity: EncounterEntity, index: number) =>
  `${entity.referenceId ?? entity.name}:${index}`;
