import axios from "axios";
import { getRefreshToken, setTokens } from "../utils/tokenUtils";

const apiRefresh = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

let refreshPromise: Promise<string> | null = null;

export async function handleRefresh(): Promise<string> {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const refresh_token = getRefreshToken();

            if (!refresh_token) throw new Error("No refresh token");

            const response = await apiRefresh.post("/auth/refresh", {
                refresh_token,
            });

            const newAccess = response.data.access_token;
            const newRefresh = response.data.refresh_token;

            setTokens(newAccess, newRefresh);

            return newAccess;
        })().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}