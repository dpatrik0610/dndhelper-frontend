import type { MiningState } from "@services/miningService";
import { type Grid, raster } from "./art/pixel";

export const FOREMAN = "Foreman Ottilie Brasshand";

export const ARRIVAL = "Fresh off the Gullrock ferry. Dig the Anvil, earn your name back.";

export const PAGES: string[] = [
  "Day one of the deep cut. Forty-one of us, one lift, and a hum in the rock the old hands swear is water. It isn't water. I've left the boy Wick up top with the bell and the last good candle. Someone has to ring us home.",
  "The Old Road runs further than any map of it. Found a boot print pressed in stone so old it's gone to glass. The toe points down. Morale is fine. Morale is always fine on day four.",
  "The galleries glitter like the inside of a geode. Sorrel swears the glitter moves when you aren't looking at it. I've ordered the crew to stop not looking at it.",
  "The Cold Halls take the heat out of your soup and the words out of your mouth. We sealed the stair behind us tonight. The hum got louder when we did, like it was pleased.",
  "Too hot to sleep, too loud to think. The hum has a rhythm now. Three slow, one quick. A heartbeat, if a heart were the size of a mountain.",
  "Lanterns don't reach far in Darkfall. The dark eats light like bread. We lost Dagna and Ferrin to a drop we never heard the bottom of. I carved their names on the seal. Wick, if you ever read this, ring the bell twice for them.",
  "Something is drinking the mountain's fire, and it's below us. The crew wants to turn back. I told them there is no back. We sealed it anyway. There was always going to be no back.",
  "Bones down here, older than dwarves. Every skull faces the same way. Down. I understand them now. You don't fall toward it. You're called.",
  "Nine of us left. The hum is a voice and the voice is singing, and I'm ashamed to say I sing along. We reach it tomorrow. Whatever it is, it's lonely. I can hear that much.",
  "It isn't here. A crater the size of a cathedral, warm as a hearth, and a hole in the middle going down. It never stopped falling. It sinks through the world slow as a candle burns, singing for someone to follow. I'm going after it. Tell Wick the bell can stop now. O.B.",
];

export const SEALS: string[] = [
  "TURN BACK. THE ROAD BELOW IS CLOSED BY ORDER OF THE FOREMAN.",
  "Closed. Nobody follows us. That's an order.",
  "If you can read this, you've got a good pick and no sense.",
  "We locked this from the far side. Think about why.",
  "Don't let it wake. Don't let it wake. Don't let it wake.",
  "DAGNA. FERRIN. Remember them. The dark won't.",
  "There is no back.",
  "It isn't calling you. It's calling anyone.",
  "Wick, I'm sorry.",
];

export const STAR_FLOOR = "The floor here is warm. Far below it, something is still humming.";

export const engraving = (depth: number) => SEALS[depth - 1] ?? STAR_FLOOR;

const BY_DEPTH: string[][] = [
  [
    "Lift still works. Hasn't stopped working in three hundred years. I oil it. Nobody asked me to.",
    "Bell rang again last night. On its own. It does that.",
    "You've got the look of someone who'll go down anyway. Fine. Bring me anything with writing on it.",
    "Gullrock ferry drops one of you every season. Rusty pick, work pardon, and a look like the world owes you a second go. It might.",
    "The reeve wants ore, not apologies. Dig enough and they'll scrub your name off the Gullrock wall.",
    "Forty-one went down this lift. You'd make forty-two. Try to come back up, eh?",
  ],
  [
    "The Old Road. The foreman used to sing on it. Badly.",
    "Kobolds are harmless. They'll just rob you blind.",
    "Heard the Bent Nail let you drink there last night. Nobody's done that for a Gullrock face in years.",
    "Mind the seals. They weren't put there to keep things in.",
  ],
  [
    "Cold Halls already? You're quicker than the last lot.",
    "If you hear a hum, it's water. That's what we all told ourselves.",
  ],
  [
    "Darkfall. Ring the bell twice when you pass it. Don't ask, just do it.",
    "You carry a lot of light for someone going that deep. Good. Keep it.",
    "Reeve came by asking after you. Your name got said in the tavern without anyone spitting. That's progress.",
  ],
  [
    "Bonewhite. They all face down, don't they? Don't you face down.",
    "I never went past the Cold Halls. My legs aren't the problem. It's the waiting. I'm good at waiting.",
  ],
  [
    "So it wasn't there. Of course it wasn't. She never could leave a song alone.",
    "It's still falling. Some nights the bell rings so soft I think it's her, very far away.",
    "Go on, then. Somebody has to keep up with her.",
    "Nobody on Saltbell thinks of Gullrock when they look at you now. They think of the Anvil.",
  ],
];

export const wickLines = (state: MiningState) => {
  const d = state.deepestDepth;
  const lines = [...BY_DEPTH[d >= 10 ? 5 : d >= 8 ? 4 : d >= 6 ? 3 : d >= 4 ? 2 : d >= 2 ? 1 : 0]];
  const pages = state.pages.length;
  if (pages === 1) lines.push('"The boy Wick." I was ninety. She always did round down.');
  if (pages > 0 && pages < PAGES.length)
    lines.push("That's her handwriting. Read me a page sometime. My eyes aren't what a candle makes them.");
  if (pages >= 6) lines.push("Twice. I rang it twice. Every night since. Didn't need the page to tell me.");
  if (pages === PAGES.length)
    lines.push('"The bell can stop now." No. I\'ll ring it till one of you comes back up with her.');
  if (state.foxRevealed)
    lines.push("Something with silver fur was sniffing round the lift. It looked at me like it knew the song.");
  lines.push("My candle? Never burnt down. Stopped asking why around year forty.");
  return lines;
};

export const wickSprite = (): Grid =>
  raster(
    [
      ".....yY.....",
      ".....oy.....",
      "....xwwx....",
      "...xhhhhx...",
      "..xxxxxxxx..",
      "..xssssssx..",
      "..xsxssxsx..",
      ".xbbsSssbbx.",
      ".xbbbbbbbbx.",
      "xcxbbbbbbxcx",
      "xcccbbbbcccx",
      ".xccccccccx.",
      ".xccccccccx.",
      "..xkkxxkkx..",
      "..xxx..xxx..",
    ],
    {
      x: "#1c1410",
      y: "#fff3a0",
      Y: "#ffd23f",
      o: "#ff8a2a",
      w: "#efeadf",
      h: "#5a4a3a",
      s: "#e2aa7c",
      S: "#b97a52",
      b: "#d8d4cc",
      c: "#4a3a5a",
      k: "#3a2a1a",
    },
  );

const DREAMS: [number, string][] = [
  [1, "You dream of a bell ringing under a lake. Every ring, the water gets warmer."],
  [1, "You dream you're a candle, and someone old is cupping a hand around you against the wind."],
  [1, "You dream of nothing at all and wake up rested. Wick would call that a miracle."],
  [1, "You dream of your old cell at Gullrock. The door's been open for weeks. You still knock before you walk out."],
  [3, "You dream the whole Bent Nail raises a mug when you walk in. Nobody spits. You wake up grinning."],
  [2, "A kobold in your dream counts your ore twice, gets two different numbers, and weeps."],
  [3, "You dream of forty-one lanterns going down a stair, and one staying at the top."],
  [4, "The rock in your dream sings three slow notes and one quick one. You already know the next verse."],
  [5, 'A dwarf with brass hands writes in a ledger, looks straight at you, and says: "Not yet."'],
  [6, "You dream of a drop with no bottom. Two names fall past you, laughing."],
  [7, "You dream of fire running uphill, like water that's forgotten which way is down."],
  [8, "In the dream every skull turns to watch you sleep. They're not unkind about it."],
  [9, "You dream of a small silver fox running up a dark shaft, looking back as if you ought to follow."],
  [
    10,
    "You dream of a star sinking through stone like a pebble through honey. It's humming your name. It's very far down.",
  ],
];

export const dreamsFor = (deepest: number) => DREAMS.filter(([d]) => d <= deepest).map(([, text]) => text);

export const MOSS_LINES = [
  "Walks the deep roads both ways. Sends the bill to your camp pouch. Don't ask how.",
  '"Brasshand? Sold her a lantern once. Overcharged her. Still feel bad about it."',
  '"Fire\'s the only thing a mimic respects. Fire and exact change."',
  '"I don\'t go down. I just never seem to come up."',
];

export const WARES: Record<string, { name: string; blurb: string }> = {
  firebolt: {
    name: "Scroll of Firebolt",
    blurb:
      "Learn it once, keep it forever. F or right-click hurls a bolt at the cursor for 3× your pick's damage. It lights the dark as it flies, leaves rock alone, and it's the only thing that hurts a mimic.",
  },
  fireball: {
    name: "Scroll of Fireball",
    blurb:
      "Moss's rarest page, only offered in the Flamewell. Turns your Firebolt into a Fireball for good: 5× your pick's damage, and it bursts on whatever it hits, burning every monster within 2 tiles.",
  },
  potion: {
    name: "Healing draught",
    blurb: "Q drinks one and heals 60% of your health. A grander home makes room for more on your belt.",
  },
  chart: {
    name: "Prospector's Chart",
    blurb: "Moss's own survey of this level. Every chest, geode, diamond and ledger page gets an X, even in the dark, and so does the motherlode if there is one.",
  },
  oil: {
    name: "Lamp Oil",
    blurb: "Thick, smoky and strong. Your lantern reaches half again as far until you leave this level.",
  },
  magmaCore: {
    name: "Magma Core",
    blurb: "One he pried out of a salamander himself, and he only ever has the one.",
  },
  torch: {
    name: "Torch",
    blurb: "Twice Hesk's price, but Hesk isn't down here.",
  },
};
