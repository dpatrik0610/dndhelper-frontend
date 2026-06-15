import { apiClient } from "@api/apiClient";
import type {
  CreateRoomRequest,
  EncounterRoom,
  JoinRoomResponse,
} from "@appTypes/EncounterRoom";

const baseUrl = "/encounterroom";

export const encounterRoomService = {
  createRoom: (request: CreateRoomRequest): Promise<EncounterRoom> =>
    apiClient<EncounterRoom>(baseUrl, { method: "POST", body: request }),

  getRoom: (roomId: string): Promise<EncounterRoom> =>
    apiClient<EncounterRoom>(`${baseUrl}/${roomId}`, {}),

  getMyRooms: (): Promise<EncounterRoom[]> =>
    apiClient<EncounterRoom[]>(`${baseUrl}/my`, {}),

  joinRoom: (joinCode: string): Promise<JoinRoomResponse> =>
    apiClient<JoinRoomResponse>(`${baseUrl}/join`, {
      method: "POST",
      body: { joinCode },

    }),

  leaveRoom: (roomId: string): Promise<void> =>
    apiClient<void>(`${baseUrl}/${roomId}/leave`, { method: "POST" }),

  deleteRoom: (roomId: string): Promise<void> =>
    apiClient<void>(`${baseUrl}/${roomId}`, { method: "DELETE" }),

  regenerateJoinCode: async (roomId: string): Promise<string> => {
    const result = await apiClient<{ joinCode: string }>(`${baseUrl}/${roomId}/code`, {
      method: "POST",

    });
    return result.joinCode;
  },

  invitePlayers: (roomId: string, userIds: string[]): Promise<void> =>
    apiClient<void>(`${baseUrl}/${roomId}/invite`, {
      method: "POST",
      body: { roomId, userIds },

    }),
};
