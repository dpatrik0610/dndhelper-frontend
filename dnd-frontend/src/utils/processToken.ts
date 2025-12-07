import { useAuthStore } from "@store/useAuthStore";
import { decodeToken } from "./decodeToken";

    export const processToken = (token: string) =>{
        const decoded = decodeToken(token);

        if (!decoded) throw new Error("Failed to decode token");
        try{
            useAuthStore.getState().setAuthData({
                token: token,
                id: decoded.id || "",
                username: decoded.username || "",
                roles: decoded.roles || [],
            });
            console.log(`Auth data stored in store.`)
        }
        catch(ex) {
            console.log(`Error setting auth data: ${ex}`)
            throw Error(`${ex}`);
        }
    }