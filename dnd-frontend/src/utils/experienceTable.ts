export interface LevelProgression {
  level: number;
  experience: number;
  proficiencyBonus: number;
}

export const EXPERIENCE_TABLE: LevelProgression[] = [
  { level: 1, experience: 0, proficiencyBonus: 2 },
  { level: 2, experience: 300, proficiencyBonus: 2 },
  { level: 3, experience: 900, proficiencyBonus: 2 },
  { level: 4, experience: 2700, proficiencyBonus: 2 },
  { level: 5, experience: 6500, proficiencyBonus: 3 },
  { level: 6, experience: 14000, proficiencyBonus: 3 },
  { level: 7, experience: 23000, proficiencyBonus: 3 },
  { level: 8, experience: 34000, proficiencyBonus: 3 },
  { level: 9, experience: 48000, proficiencyBonus: 4 },
  { level: 10, experience: 64000, proficiencyBonus: 4 },
  { level: 11, experience: 85000, proficiencyBonus: 4 },
  { level: 12, experience: 100000, proficiencyBonus: 4 },
  { level: 13, experience: 120000, proficiencyBonus: 5 },
  { level: 14, experience: 140000, proficiencyBonus: 5 },
  { level: 15, experience: 165000, proficiencyBonus: 5 },
  { level: 16, experience: 195000, proficiencyBonus: 5 },
  { level: 17, experience: 225000, proficiencyBonus: 6 },
  { level: 18, experience: 265000, proficiencyBonus: 6 },
  { level: 19, experience: 305000, proficiencyBonus: 6 },
  { level: 20, experience: 355000, proficiencyBonus: 6 },
];

export const getLevelForExperience = (experience: number): LevelProgression => {
  const safeExp = Math.max(0, experience);
  let current = EXPERIENCE_TABLE[0];

  for (const row of EXPERIENCE_TABLE) {
    if (safeExp >= row.experience) {
      current = row;
    } else {
      break;
    }
  }

  return current;
};

export const getNextLevel = (experience: number): LevelProgression | null => {
  const safeExp = Math.max(0, experience);
  return EXPERIENCE_TABLE.find((row) => row.experience > safeExp) ?? null;
};

export const getExperienceProgress = (experience: number) => {
  const current = getLevelForExperience(experience);
  const next = getNextLevel(experience);

  if (!next) {
    return {
      current,
      next: null as LevelProgression | null,
      remaining: 0,
      progressPercent: 100,
    };
  }

  const span = next.experience - current.experience;
  const progress = span === 0 ? 0 : ((experience - current.experience) / span) * 100;

  return {
    current,
    next,
    remaining: Math.max(0, next.experience - Math.max(0, experience)),
    progressPercent: Math.min(100, Math.max(0, progress)),
  };
};
