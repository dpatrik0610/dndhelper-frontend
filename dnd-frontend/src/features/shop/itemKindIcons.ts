import {
    IconArrowNarrowRight, IconBackpack, IconBook2, IconBow, IconDiamond, IconFlame, IconFlask,
    IconHanger, IconMeat, IconPackage, IconShield, IconSword, IconTool, IconWand,
    type Icon,
} from "@tabler/icons-react";
import type { ItemKind } from "@utils/itemKind";

export const ITEM_KIND_ICON: Record<ItemKind, Icon> = {
    potion: IconFlask,
    scroll: IconBook2,
    ammo: IconArrowNarrowRight,
    ranged: IconBow,
    weapon: IconSword,
    armor: IconShield,
    jewelry: IconDiamond,
    arcane: IconWand,
    clothing: IconHanger,
    tool: IconTool,
    light: IconFlame,
    food: IconMeat,
    container: IconBackpack,
    gear: IconPackage,
};
