import { RuleCategory, type RuleDetail, type RuleSnippet } from "@appTypes/Rules/Rule";

export const mockRuleSnippets: RuleSnippet[] = [
  {
    slug: "advantage-disadvantage",
    title: "Advantage & disadvantage",
    category: RuleCategory.Core,
    summary: "Roll two d20s for ability checks, attack rolls, or saves; keep the highest for advantage or lowest for disadvantage.",
    tags: ["d20", "core", "checks"],
    source: { title: "SRD", page: "7" },
  },
  {
    slug: "opportunity-attacks",
    title: "Opportunity attacks",
    category: RuleCategory.Combat,
    summary: "Leaving a hostile creature's reach provokes a single melee attack using your reaction.",
    tags: ["combat", "reaction"],
    source: { title: "SRD", page: "13" },
  },
  {
    slug: "concentration",
    title: "Concentration",
    category: RuleCategory.Magic,
    summary: "You can concentrate on one spell; some damage or casting another concentration spell ends it.",
    tags: ["spells", "timers"],
    source: { title: "SRD", page: "15" },
  },
  {
    slug: "cover",
    title: "Cover",
    category: RuleCategory.Combat,
    summary: "+2 to AC and Dex saves for half cover, +5 for three-quarters, total cover blocks targeting.",
    tags: ["combat", "positioning"],
    source: { title: "SRD", page: "16" },
  },
  {
    slug: "resting",
    title: "Resting",
    category: RuleCategory.Downtime,
    summary: "Short rest: 1 hour to spend hit dice. Long rest: 8 hours to recover most resources.",
    tags: ["recovery", "downtime"],
    source: { title: "SRD", page: "21" },
  },
  {
    slug: "conditions",
    title: "Conditions",
    category: RuleCategory.Status,
    summary: "Persistent effects like blinded, prone, or restrained; each defines penalties and saves.",
    tags: ["statuses", "saving throws"],
    source: { title: "SRD", page: "24" },
  },
  {
    slug: "exhaustion",
    title: "Exhaustion",
    category: RuleCategory.Status,
    summary: "Six escalating levels of fatigue; the sixth level results in death.",
    tags: ["statuses", "resting"],
    source: { title: "SRD", page: "25" },
  },
  {
    slug: "light-and-vision",
    title: "Light and vision",
    category: RuleCategory.Exploration,
    summary: "Bright, dim, and darkness affect Perception; darkvision halves penalties in darkness.",
    tags: ["exploration", "environment"],
    source: { title: "SRD", page: "29" },
  },
  {
    slug: "movement-and-difficult-terrain",
    title: "Movement & difficult terrain",
    category: RuleCategory.Combat,
    summary: "Each foot of difficult terrain costs an extra foot of movement; some effects reduce your speed.",
    tags: ["movement", "terrain", "combat"],
    source: { title: "SRD", page: "11" },
  },
  {
    slug: "hiding-and-stealth",
    title: "Hiding & stealth",
    category: RuleCategory.Exploration,
    summary: "To hide, you must be unseen and unheard; contests Stealth vs. Passive Perception or Perception checks.",
    tags: ["stealth", "exploration", "skill checks"],
    source: { title: "SRD", page: "14" },
  },
  {
    slug: "spell-components",
    title: "Spell components",
    category: RuleCategory.Magic,
    summary: "Spells may require verbal, somatic, or material components; a focus can replace non-costly materials.",
    tags: ["spells", "components", "casting"],
    source: { title: "SRD", page: "12" },
  },
  {
    slug: "ritual-casting",
    title: "Ritual casting",
    category: RuleCategory.Magic,
    summary: "Casting a spell with the ritual tag takes 10 extra minutes but doesn't expend a spell slot.",
    tags: ["spells", "rituals", "casting"],
    source: { title: "SRD", page: "12" },
  },
  {
    slug: "bonus-actions",
    title: "Bonus actions",
    category: RuleCategory.Core,
    summary: "Some features let you take one bonus action on your turn; you can take only one bonus action per turn.",
    tags: ["turn", "actions"],
    source: { title: "SRD", page: "10" },
  },
  {
    slug: "reactions",
    title: "Reactions",
    category: RuleCategory.Core,
    summary: "A reaction is a quick response to a trigger; you regain your reaction at the start of your turn.",
    tags: ["turn", "actions", "reaction"],
    source: { title: "SRD", page: "10" },
  },
  {
    slug: "grappling",
    title: "Grappling",
    category: RuleCategory.Combat,
    summary: "Use the Attack action to make a special melee attack; contest Athletics vs Athletics/Acrobatics to grab.",
    tags: ["combat", "conditions", "movement"],
    source: { title: "SRD", page: "18" },
  },
  {
    slug: "prone",
    title: "Prone",
    category: RuleCategory.Status,
    summary: "A prone creature crawls or must stand using half movement; attacks from 5 feet have advantage, ranged attacks have disadvantage.",
    tags: ["conditions", "movement", "combat"],
    source: { title: "SRD", page: "24" },
  },
  {
    slug: "invisibility",
    title: "Invisibility",
    category: RuleCategory.Status,
    summary: "An invisible creature can't be seen without magic; attacks against it have disadvantage, its attacks have advantage.",
    tags: ["conditions", "stealth", "magic"],
    source: { title: "SRD", page: "27" },
  },
  {
    slug: "passive-perception",
    title: "Passive Perception",
    category: RuleCategory.Core,
    summary: "10 + modifiers represents your average Perception without rolling; used to spot hidden threats.",
    tags: ["perception", "core", "skills"],
    source: { title: "SRD", page: "8" },
  },
  {
    slug: "death-saving-throws",
    title: "Death saving throws",
    category: RuleCategory.Combat,
    summary: "At 0 HP, roll a d20 each turn: 3 successes stabilize you; 3 failures mean death; natural 20 heals 1 HP, natural 1 counts as 2 failures.",
    tags: ["combat", "dying", "saves"],
    source: { title: "SRD", page: "9" },
  },
  {
    slug: "carrying-capacity",
    title: "Carrying capacity",
    category: RuleCategory.Equipment,
    summary: "You can typically carry a number of pounds equal to 15 × your Strength score; variants may change this.",
    tags: ["equipment", "encumbrance", "strength"],
    source: { title: "SRD", page: "34" },
  },
  {
    slug: "exhaustion-recovery",
    title: "Exhaustion recovery",
    category: RuleCategory.Downtime,
    summary: "Finishing a long rest reduces exhaustion by 1; some magic or features can reduce additional levels.",
    tags: ["resting", "statuses", "recovery"],
    source: { title: "SRD", page: "25" },
  },
  {
    slug: "social-interaction",
    title: "Social interaction",
    category: RuleCategory.Core,
    summary: "Attitudes (friendly/indifferent/hostile) guide NPC reactions; checks like Persuasion, Deception, Intimidation influence outcomes.",
    tags: ["social", "roleplay", "skills"],
    source: { title: "SRD", page: "30" },
  },
  {
    slug: "ability-checks",
    title: "Ability checks",
    category: RuleCategory.Core,
    summary: "Roll a d20 + modifiers vs. DC; advantage/disadvantage applies; proficiency adds proficiency bonus to trained skills/tools.",
    tags: ["core", "skills", "proficiency"],
    source: { title: "SRD", page: "7" },
  },
  {
    slug: "saving-throws",
    title: "Saving throws",
    category: RuleCategory.Core,
    summary: "Roll a d20 + save modifier vs. effect DC; some classes grant save proficiencies; advantage/disadvantage applies when specified.",
    tags: ["core", "defense", "saves"],
    source: { title: "SRD", page: "7" },
  },
  {
    slug: "travel-pacing",
    title: "Travel pacing",
    category: RuleCategory.Exploration,
    summary: "Slow pace: stealth; normal pace: standard; fast pace: -5 Passive Perception. Affects overland travel distances.",
    tags: ["exploration", "travel", "pace"],
    source: { title: "SRD", page: "31" },
  },
  {
    slug: "marching-order",
    title: "Marching order",
    category: RuleCategory.Exploration,
    summary: "Front/middle/rear positions determine who spots hazards or triggers encounters first.",
    tags: ["exploration", "party", "hazards"],
    source: { title: "SRD", page: "31" },
  },
  {
    slug: "traps-and-hazards",
    title: "Traps & hazards",
    category: RuleCategory.Exploration,
    summary: "Traps have trigger, effect, DC to detect/disarm. Hazards like falling or suffocation have set damages and timers.",
    tags: ["hazards", "traps", "environment"],
    source: { title: "SRD", page: "32" },
  },
  {
    slug: "cover-and-concealment",
    title: "Concealment",
    category: RuleCategory.Combat,
    summary: "Heavily obscured areas block vision; unseen targets impose disadvantage on attacks against them.",
    tags: ["combat", "vision", "obscured"],
    source: { title: "SRD", page: "29" },
  },
  {
    slug: "exhaustion-variant",
    title: "Exhaustion variant (gritty)",
    category: RuleCategory.Downtime,
    summary: "Optional: gain exhaustion when deprived of long rest; long rest removes one level; adjust to your table's pacing.",
    tags: ["variant", "resting", "statuses"],
    source: { title: "SRD", page: "25" },
  },
  {
    slug: "downtime-activities",
    title: "Downtime activities",
    category: RuleCategory.Downtime,
    summary: "Crafting, researching, carousing, training; each takes time, gold, and checks determined by the DM.",
    tags: ["downtime", "crafting", "research"],
    source: { title: "SRD", page: "37" },
  },
  {
    slug: "tool-proficiencies",
    title: "Tool proficiencies",
    category: RuleCategory.Equipment,
    summary: "Tool proficiencies let you add proficiency bonus to related checks and can unlock extra context in challenges.",
    tags: ["tools", "skills", "proficiency"],
    source: { title: "SRD", page: "38" },
  },
  {
    slug: "suffocation",
    title: "Suffocation",
    category: RuleCategory.Status,
    summary: "You can hold breath for 1 + Con modifier minutes; then survive Con modifier rounds; then drop to 0 HP.",
    tags: ["hazards", "environment", "breath"],
    source: { title: "SRD", page: "33" },
  },
  {
    slug: "falling",
    title: "Falling",
    category: RuleCategory.Combat,
    summary: "Take 1d6 bludgeoning damage per 10 feet fallen (max 20d6); land prone if you take any damage.",
    tags: ["hazards", "movement", "combat"],
    source: { title: "SRD", page: "33" },
  },
  {
    slug: "mounted-combat",
    title: "Mounted combat",
    category: RuleCategory.Combat,
    summary: "Mount moves on your turn; controlled mounts have limited actions. Attacks can target you or the mount.",
    tags: ["combat", "mounts", "movement"],
    source: { title: "SRD", page: "35" },
  },
  {
    slug: "two-weapon-fighting",
    title: "Two-weapon fighting",
    category: RuleCategory.Combat,
    summary: "When you attack with a light melee weapon, you can bonus action attack with another light melee weapon (no ability mod to damage unless feature).",
    tags: ["combat", "actions", "bonus action"],
    source: { title: "SRD", page: "36" },
  },
  {
    slug: "short-rest",
    title: "Short rest",
    category: RuleCategory.Downtime,
    summary: "At least 1 hour of light activity; spend hit dice to heal and regain features that refresh on a short rest.",
    tags: ["resting", "recovery", "hit dice"],
    source: { title: "SRD" },
  },
  {
    slug: "long-rest",
    title: "Long rest",
    category: RuleCategory.Downtime,
    summary: "At least 8 hours; regain all hit points, half spent hit dice, and most class resources; ends early if interrupted.",
    tags: ["resting", "recovery", "resources"],
    source: { title: "SRD" },
  },
  {
    slug: "ready-action-homebrew",
    title: "Ready action",
    category: RuleCategory.Combat,
    summary: "Declare a trigger and action; when it occurs, spend your reaction to execute it. If the trigger never comes, the action is lost.",
    tags: ["reaction", "timing", "action economy"],
    source: { title: "Homebrew" },
  },
  {
    slug: "advantage-negation",
    title: "Advantage cancels disadvantage",
    category: RuleCategory.Core,
    summary: "Any amount of advantage and disadvantage cancel to a normal roll; no stacking beyond that.",
    tags: ["d20", "core"],
    source: { title: "Table ruling" },
  },
  {
    slug: "climbing-homebrew",
    title: "Climbing speed",
    category: RuleCategory.Exploration,
    summary: "Climbing costs double movement; on hard surfaces, make Athletics against a DC set by the DM.",
    tags: ["movement", "athletics", "terrain"],
    source: { title: "Homebrew" },
  },
  {
    slug: "falling-prone-save",
    title: "Falling & prone check",
    category: RuleCategory.Combat,
    summary: "Take 1d6/10 ft (max 20d6) on a fall; make Athletics to avoid being knocked prone.",
    tags: ["hazards", "prone", "athletics"],
    source: { title: "Homebrew" },
  },
  {
    slug: "rounding-down",
    title: "Rounding down",
    category: RuleCategory.Core,
    summary: "When halving or splitting odd numbers (e.g., movement), always round down.",
    tags: ["math", "movement", "core"],
    source: { title: "5e convention" },
  },
  {
    slug: "high-low-ground",
    title: "High vs low ground",
    category: RuleCategory.Combat,
    summary: "15 ft elevation difference: attacking down grants advantage and +5 ft range; up grants disadvantage.",
    tags: ["positioning", "advantage", "range"],
    source: { title: "Homebrew" },
  },
  {
    slug: "hiding-from-height",
    title: "Hiding from elevation",
    category: RuleCategory.Exploration,
    summary: "You can hide from elevation if line of sight is blocked; near an edge, your height should be at least half the wall to stay unseen.",
    tags: ["stealth", "vision", "height"],
    source: { title: "Homebrew" },
  },
  {
    slug: "spell-save-math",
    title: "Spell save math",
    category: RuleCategory.Magic,
    summary: "Targets roll d20 + ability mod + proficiency (if any) against caster's Spell Save DC (8 + prof + casting mod).",
    tags: ["spells", "saves", "dc"],
    source: { title: "SRD" },
  },
  {
    slug: "pre-fight-scouting",
    title: "Pre-fight scouting checks",
    category: RuleCategory.Combat,
    summary: "Before initiative, one player may roll Arcana and Perception to learn resistances/weaknesses on set DC tiers.",
    tags: ["initiative", "scouting", "checks"],
    source: { title: "Homebrew" },
  },
  {
    slug: "hp-calculation-homebrew",
    title: "HP calculation by level",
    category: RuleCategory.Core,
    summary: "Level X HP: Max hit die + (average hit die * (X-1)) + (CON mod * X).",
    tags: ["hit points", "leveling", "math"],
    source: { title: "Homebrew" },
  },
  {
    slug: "inspiration-xp",
    title: "Inspiration XP bonus",
    category: RuleCategory.Core,
    summary: "From level 3, each spent inspiration grants level × 100 XP; use inspiration to reroll or modify an action retroactively.",
    tags: ["inspiration", "xp", "progression"],
    source: { title: "Homebrew" },
  },
  {
    slug: "healing-potion-bonus-action",
    title: "Healing potion as bonus action",
    category: RuleCategory.Combat,
    summary: "Drinking a healing potion is a bonus action; other potions/oils still cost an action.",
    tags: ["potions", "actions", "healing"],
    source: { title: "Homebrew" },
  },
];

export const mockRuleDetails: RuleDetail[] = [
  {
    ...mockRuleSnippets.find((r) => r.slug === "advantage-disadvantage")!,
    body: [
      "When you have advantage or disadvantage on an ability check, attack roll, or saving throw, roll two d20s instead of one.",
      "Advantage: use the higher of the two rolls. Disadvantage: use the lower.",
      "Multiple sources of advantage or disadvantage do not stack; if you have at least one of each, they cancel.",
    ],
    examples: [
      {
        title: "Flanking a distracted foe",
        description: "A rogue attacking a prone creature with an ally adjacent gains advantage.",
      },
    ],
    references: [{ type: "condition", name: "Prone", slug: "prone" } as unknown as never],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "opportunity-attacks")!,
    body: [
      "You can make one melee attack as a reaction when a hostile creature you can see leaves your reach.",
      "The attack happens just before the target leaves. It does not trigger if the creature takes the Disengage action or is forced to move without using its own movement, action, or reaction.",
    ],
    examples: [
      {
        description: "A fighter with a reach weapon can make the attack when a creature leaves 10 feet of reach, not just 5.",
      },
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "concentration")!,
    body: [
      "You can concentrate on only one spell at a time.",
      "Taking damage forces a Constitution saving throw: DC 10 or half the damage, whichever is higher.",
      "Being incapacitated or casting another concentration spell ends the current concentration.",
    ],
    examples: [
      {
        description: "If you are concentrating on Bless and cast Invisibility, Bless ends immediately.",
      },
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "cover")!,
    body: [
      "Half cover grants +2 bonus to AC and Dexterity saving throws.",
      "Three-quarters cover grants +5 bonus to AC and Dexterity saving throws.",
      "Total cover prevents a target from being directly targeted.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "resting")!,
    body: [
      "Short rest: at least 1 hour doing nothing more strenuous than eating, drinking, and tending wounds. Spend hit dice to regain hit points.",
      "Long rest: at least 8 hours of sleep and light activity; restores hit points, half your spent hit dice, and most class resources.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "conditions")!,
    body: [
      "Conditions impose specific penalties or limitations. They stack unless directly contradictory.",
      "Common conditions include blinded, charmed, deafened, frightened, grappled, incapacitated, invisible, paralyzed, petrified, poisoned, prone, restrained, stunned, and unconscious.",
    ],
    relatedRuleSlugs: ["exhaustion", "prone", "grappled"],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "exhaustion")!,
    body: [
      "Exhaustion is tracked in six levels: (1) disadvantage on ability checks, (2) speed halved, (3) disadvantage on attacks and saving throws, (4) hit point maximum halved, (5) speed reduced to 0, (6) death.",
      "Finishing a long rest reduces exhaustion by 1 level. Effects that reduce exhaustion state so explicitly.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "light-and-vision")!,
    body: [
      "Areas of bright light allow normal vision. Dim light imposes disadvantage on Wisdom (Perception) checks that rely on sight.",
      "Darkness heavily obscures vision; most checks relying on sight automatically fail, and attack rolls against unseen targets are made with disadvantage.",
      "Darkvision lets a creature see in dim light within a specific range as if it were bright light, and in darkness as if it were dim light.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "movement-and-difficult-terrain")!,
    body: [
      "Each foot of movement in difficult terrain costs 1 extra foot. Effects that reduce speed combine with terrain costs.",
      "Some conditions set speed to 0; in those cases, terrain costs are irrelevant until speed is restored.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "hiding-and-stealth")!,
    body: [
      "To hide, you must be unseen and unheard. Make a Dexterity (Stealth) check contested by passive Perception.",
      "You lose hidden status if you make noise, attack, or become seen; DM adjudicates visibility and sound.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "spell-components")!,
    body: [
      "Verbal: you must be able to speak; silence or gagging blocks it.",
      "Somatic: you need at least one free hand.",
      "Material: a focus can replace non-costly components; costly components are consumed if noted.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "ritual-casting")!,
    body: [
      "Casting a ritual adds 10 minutes to the casting time and does not expend a spell slot.",
      "You must have the ritual tag on the spell and the feature that allows ritual casting.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "bonus-actions")!,
    body: [
      "You can take at most one bonus action on your turn, and only if a feature, spell, or ability grants it.",
      "You choose when to take it during your turn, unless the granting feature specifies otherwise.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "reactions")!,
    body: [
      "You have one reaction per round that refreshes at the start of your turn.",
      "Reactions occur when a trigger is met; some spells and features specify unique triggers.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "grappling")!,
    body: [
      "Use the Attack action to replace one attack with a grapple: Athletics vs. target's Athletics or Acrobatics.",
      "On success, target's speed becomes 0. The grapple ends if you're incapacitated or the target is moved out of your reach.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "prone")!,
    body: [
      "Prone creatures crawl or stand up using half movement.",
      "Melee attacks from within 5 feet have advantage; ranged attacks against the prone creature have disadvantage.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "invisibility")!,
    body: [
      "An invisible creature is impossible to see without magic or special sense; its location may be revealed by noise or tracks.",
      "Attacks against an invisible creature have disadvantage; its attacks have advantage.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "passive-perception")!,
    body: [
      "Passive Perception = 10 + Perception modifiers; represents average alertness without rolling.",
      "Apply penalties such as fast pace or dim light; advantage/disadvantage adjusts by ±5.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "death-saving-throws")!,
    body: [
      "At the start of each turn at 0 HP, roll a d20. 10+ is a success; 9- is a failure.",
      "Three successes stabilize you; three failures cause death. Nat 20: regain 1 HP. Nat 1: two failures.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "carrying-capacity")!,
    body: [
      "Default: you can carry weight up to 15 × Strength score in pounds.",
      "Optional encumbrance variants may add speed penalties at lower thresholds.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "social-interaction")!,
    body: [
      "NPC attitude (friendly, indifferent, hostile) guides baseline behavior.",
      "Skills like Persuasion, Deception, and Intimidation can shift outcomes; DCs depend on stakes and attitude.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "ability-checks")!,
    body: [
      "Roll d20 + ability mod + proficiency if trained; compare to DC set by the DM.",
      "Advantage/disadvantage applies as circumstances warrant; passive scores equal 10 + modifiers.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "saving-throws")!,
    body: [
      "Roll d20 + save modifier; some classes grant proficiency in specific saves.",
      "Advantage/disadvantage or special resistances may modify the roll; success/failure effects are set by the source.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "travel-pacing")!,
    body: [
      "Slow pace: best for stealth; Normal pace: no modifiers; Fast pace: -5 to Passive Perception.",
      "Pace influences overland distance per day; adjust for terrain and mounts.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "marching-order")!,
    body: [
      "Assign front/middle/rear to determine who spots hazards, triggers traps, or is targeted first.",
      "Small passages may force single file; adjust based on marching formation.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "traps-and-hazards")!,
    body: [
      "Traps list trigger, effect, DC to detect, and DC/tool to disarm; failures may trigger the trap.",
      "Environmental hazards (suffocation, falling, extreme heat/cold) include timers and damage values.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "cover-and-concealment")!,
    body: [
      "Heavily obscured areas block vision; unseen attackers impose disadvantage on attacks against them.",
      "Combine with cover bonuses for difficult targeting environments.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "exhaustion-variant")!,
    body: [
      "Optional pacing: gain exhaustion when deprived of proper long rest or from harsh conditions.",
      "Long rests remove one level; tailor triggers to the campaign's grittiness.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "downtime-activities")!,
    body: [
      "Common activities: crafting, researching, training, carousing. Each has time and gold costs plus ability checks.",
      "DM defines DCs and consequences; progress may require multiple downtime periods.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "tool-proficiencies")!,
    body: [
      "Being proficient with a tool lets you add proficiency to checks that meaningfully use the tool.",
      "Tools can provide alternate ways to solve obstacles or add context in investigations.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "suffocation")!,
    body: [
      "Hold breath for a number of minutes equal to 1 + Con modifier (minimum 30 seconds).",
      "After that, you can survive for Con modifier rounds; then you drop to 0 HP and start dying.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "falling")!,
    body: [
      "Take 1d6 bludgeoning damage per 10 feet fallen (max 20d6).",
      "If you take any damage, you land prone unless an effect states otherwise.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "mounted-combat")!,
    body: [
      "Controlled mounts move on your initiative and can Dash, Disengage, or Dodge.",
      "If you fall off your mount, take falling damage as normal; mounts can be targeted separately.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "two-weapon-fighting")!,
    body: [
      "When you take the Attack action with a light melee weapon, you can use a bonus action to attack with another light melee weapon.",
      "You don't add your ability modifier to the off-hand damage unless a feature says otherwise.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "short-rest")!,
    body: [
      "- Duration: at least 1 hour of light activity.",
      "- Healing: spend any number of hit dice after the rest to regain HP; add CON mod per die.",
      "- Recovery: regain features that refresh on a short rest (per class/feature).",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "long-rest")!,
    body: [
      "- Duration: at least 8 hours; no more than 2 hours of light activity; ends early if too much strenuous activity.",
      "- Healing: regain all hit points; regain spent hit dice equal to half your total (minimum 1).",
      "- Recovery: regain most class resources; some features/spells specify exceptions.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "ready-action-homebrew")!,
    body: [
      "- Declare a trigger and the action you will take.",
      "- When the trigger occurs, spend your reaction to execute the readied action.",
      "- If the trigger does not occur before your next turn, the readied action is lost.",
      "- You cannot delay your initiative to go after someone else with this rule.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "advantage-negation")!,
    body: [
      "- Any amount of advantage and disadvantage cancel to a normal d20 roll.",
      "- Multiple sources do not stack; if at least one of each is present, roll once as normal.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "climbing-homebrew")!,
    body: [
      "- Climbing costs double your movement speed on climbable surfaces.",
      "- For hard or slick terrain, make Strength (Athletics) against a DC the DM sets.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "falling-prone-save")!,
    body: [
      "- Take 1d6 bludgeoning damage per 10 feet fallen (max 20d6).",
      "- Make Strength (Athletics) (DC by DM) to avoid landing prone.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "rounding-down")!,
    body: [
      "- When halving or dividing odd numbers (movement, damage, etc.), round down.",
      "- Example: 25 ft movement halved (prone) becomes 12 ft.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "high-low-ground")!,
    body: [
      "- With ~15 ft elevation difference: attacking downward grants advantage and +5 ft effective range per 15 ft.",
      "- Attacking upward imposes disadvantage under the same difference.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "hiding-from-height")!,
    body: [
      "- You can hide if line of sight is blocked by height/distance; DM adjudicates.",
      "- Directly beneath a ledge: your height should be about half the wall height to stay unseen unless the observer looks straight down.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "spell-save-math")!,
    body: [
      "- Target roll: d20 + relevant ability mod + proficiency (if proficient).",
      "- Compare vs caster Spell Save DC: 8 + proficiency + casting mod.",
      "- Roll ≥ DC: target succeeds (often half damage). Roll < DC: full effect per spell text.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "pre-fight-scouting")!,
    body: [
      "- Before initiative, one player may roll Arcana and Perception at set DC tiers.",
      "- Arcana: low tier = ask about one element/condition/magical effect; high tier = one strength + one weakness if present.",
      "- Perception: low tier = ask one physical weakness or strength; high tier = one of each if present.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "hp-calculation-homebrew")!,
    body: [
      "### Formula\n$$\\text{HP}_X = \\text{MaxHD}_1 + \\text{AvgHD} \\times (X-1) + \\text{CON} \\times X$$",
      "- MaxHD₁: maximum value of your class hit die at level 1 (e.g., d8 → 8).",
      "- AvgHD: official average of your class hit die after level 1 (d6=4, d8=5, d10=6, d12=7) unless you roll.",
      "- CON: your Constitution modifier.",
      "- Example (d8 class, CON +2): level 5 → 8 + (5 × 4) + (2 × 5) = 38 HP.",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "inspiration-xp")!,
    body: [
      "- Starting at level 3, every time you spend inspiration you gain level × 100 XP.",
      "- Spend inspiration to reroll any check or retroactively modify an action (DM permitting).",
    ],
  },
  {
    ...mockRuleSnippets.find((r) => r.slug === "healing-potion-bonus-action")!,
    body: [
      "- Drinking a healing potion uses a bonus action.",
      "- Other potions, oils, and coatings still require an action unless otherwise specified.",
    ],
  },
];
