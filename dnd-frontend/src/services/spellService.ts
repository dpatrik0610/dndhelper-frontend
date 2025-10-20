import { apiClient } from "../api/apiClient"
import type { Spell } from "../types/Spell"

const baseUrl = "/spells"

export interface SpellNameResponse {
    id: string
    name: string
    level: number
    school: string
}

export async function getSpellNames(token: string): Promise<SpellNameResponse[]>{
    return await apiClient(`${baseUrl}/names`, {method: "GET", token});
}

export async function getSpellById(spellId: string, token: string): Promise<Spell> {
    return await apiClient(`${baseUrl}/${spellId}`, {method: "GET", token});
}