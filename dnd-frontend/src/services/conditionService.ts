const BASE_URL = "https://www.dnd5eapi.co/api/2014/conditions";

/**
 * Fetches all available conditions from the DnD 5e API.
 * Returns only their names as an array of strings.
 */
export async function getConditions(): Promise<string[]> {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`Failed to fetch conditions: ${res.status}`);

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((cond: { name: string }) => cond.name);
  } catch (error) {
    console.error("Error fetching conditions:", error);
    return [];
  }
}

/**
 * Fetches detailed information about a specific condition by name.
 * Returns an array of description strings.
 */
export async function getCondition(name: string): Promise<string[]> {
  try {
    const formatted = name.trim().toLowerCase().replace(/\s+/g, "-");
    const res = await fetch(`${BASE_URL}/${formatted}`);
    if (!res.ok) throw new Error(`Condition "${name}" not found`);

    const data = await res.json();
    return data.desc ?? [];
  } catch (error) {
    console.error(`Error fetching condition "${name}":`, error);
    return [];
  }
}
