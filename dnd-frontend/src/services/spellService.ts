import { apiClient } from "../api/apiClient"
import type { Spell } from "../types/Spell"

const baseUrl = "/Spells"

export interface SpellNameResponse {
    id: string
    name: string
    level: number
    school: { name: string | null } | null
}

export async function getSpellNames(): Promise<SpellNameResponse[]>{
    return await apiClient(`${baseUrl}/names`, {method: "GET" });
}

export async function getSpellById(spellId: string): Promise<Spell> {
    return await apiClient(`${baseUrl}/${spellId}`, {method: "GET" });
}

export async function createSpell(spell: Spell): Promise<Spell> {
    if(!spell) return Promise.reject("Spell is undefined");
    return await apiClient(`${baseUrl}`, {method: "POST", body: spell });
}

export async function updateSpell(spellId: string, spell: Spell): Promise<Spell> {
    if(!spell) return Promise.reject("Spell is undefined");
    return await apiClient(`${baseUrl}/${spellId}`, {method: "PUT", body: spell });
}

export async function deleteSpell(spellId: string): Promise<void> {
    return await apiClient(`${baseUrl}/${spellId}`, {method: "DELETE" });
}
