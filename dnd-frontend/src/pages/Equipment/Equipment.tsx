import { Group, Title } from "@mantine/core";
import { useAuthStore } from "../../store/useAuthStore";
import { apiClient } from "../../api/apiClient";
import { Text } from "@mantine/core";
import { useEffect, useState } from "react";

export async function getInventory(token : string, id : string): Promise<JSON>{
    if(!token) throw new Error("Token is required to fetch characters");

    const response = await apiClient<JSON>(`/inventory/character/${id}`, { method: "GET", token });
    console.log(response);
    const json : JSON = {} as JSON;
    if(!response) return json;

    return response;
}

export async function loadInventory(token: string, userId: string) {
//   const characters = await getInventory(token, userId);
//   useInventoryStore.getState().setInventory(characters);
//   return characters;
}

export default function Equipment() {
    // const token = useAuthStore.getState().token ?? "";
    // const userId = useAuthStore.getState().id ?? "";
    // const inventory = useInventoryStore.getState().inventory;

    // useEffect(() => {
    //     if (!inventory) useInventoryStore.setInventory(getInventory(token, userId));
    // }, [inventory])

    return <>
        <Group>
            <Title>Equipment</Title>
            {/* <Text>{JSON.stringify(inventory)}</Text> */}
        </Group>
    </>
}