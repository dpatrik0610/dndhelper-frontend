import type { Event } from "../types/Event";

// Mock data for demo
const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    type: "Quest",
    message: "Completed the quest 'Echoes of the Desert'.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "2",
    type: "Item",
    message: "Acquired a new item: 'Blade of the Fallen Sun'.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "3",
    type: "Crafting",
    message: "Forged a 'Phoenixsteel Ingot' using rare materials.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: "4",
    type: "Exploration",
    message: "Discovered a hidden shrine deep in the ruins of Tarsin.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: "5",
    type: "Level Up",
    message: "Reached Level 9 — your aura flickers with new power.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
];

// Simulate a network delay
export async function getRecentEvents(): Promise<Event[]> {
  return new Promise((resolve, reject) => {
    const delay = Math.random() * 1000 + 500; // 500–1500ms

    setTimeout(() => {
      if (Math.random() < 0.1) {
        // 10% chance to simulate an error
        reject(new Error("Network error while fetching events"));
      } else {
        // Shuffle slightly to simulate dynamic data
        const shuffled = [...MOCK_EVENTS].sort(() => Math.random() - 0.5);
        resolve(shuffled);
      }
    }, delay);
  });
}
