export interface Spell {
  id?: string;
  index: string;
  name: string;
  description: string[];
  higherLevel: string[];
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  castingTime: string;
  level: number;
  attackType?: string;
  damage?: {
    damageType: {
      name: string;
    };
    damageAtSlotLevel?: Record<string, string>;
    damageAtCharacterLevel?: Record<string, string>;
  };
  dc?: {
    dcType: {
      name: string;
    };
    dcSuccess: string;
    desc?: string;
  };
  areaOfEffect?: {
    type: string;
    size: number;
  };
  school: {
    name: string;
  };
  classes: Array<{
    name: string;
  }>;
  subclasses: Array<{
    name: string;
  }>;
  healAtSlotLevel?: Record<string, string>;
  spellUrl: string;
}