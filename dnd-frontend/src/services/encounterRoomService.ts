import { apiClient } from "@api/apiClient";
import type {
  CreateRoomRequest,
  EncounterRoom,
  JoinRoomResponse,
} from "@appTypes/EncounterRoom";

const baseUrl = "/encounterroom";

export const encounterRoomService = {
  createRoom: (request: CreateRoomRequest, token: string): Promise<EncounterRoom> =>
    apiClient<EncounterRoom>(baseUrl, { method: "POST", body: request, token }),

  getRoom: (roomId: string, token: string): Promise<EncounterRoom> =>
    apiClient<EncounterRoom>(`${baseUrl}/${roomId}`, { token }),

  getMyRooms: (token: string): Promise<EncounterRoom[]> =>
    apiClient<EncounterRoom[]>(`${baseUrl}/my`, { token }),

  joinRoom: (joinCode: string, token: string): Promise<JoinRoomResponse> =>
    apiClient<JoinRoomResponse>(`${baseUrl}/join`, {
      method: "POST",
      body: { joinCode },
      token,
    }),

  leaveRoom: (roomId: string, token: string): Promise<void> =>
    apiClient<void>(`${baseUrl}/${roomId}/leave`, { method: "POST", token }),

  deleteRoom: (roomId: string, token: string): Promise<void> =>
    apiClient<void>(`${baseUrl}/${roomId}`, { method: "DELETE", token }),

  regenerateJoinCode: async (roomId: string, token: string): Promise<string> => {
    const result = await apiClient<{ joinCode: string }>(`${baseUrl}/${roomId}/code`, {
      method: "POST",
      token,
    });
    return result.joinCode;
  },

  invitePlayers: (roomId: string, userIds: string[], token: string): Promise<void> =>
    apiClient<void>(`${baseUrl}/${roomId}/invite`, {
      method: "POST",
      body: { roomId, userIds },
      token,
    }),
};
