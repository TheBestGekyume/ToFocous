import { getAccessToken, getTokenExpiration } from "../utils/tokenUtils";

export function isAuthenticated(): boolean {
    const token = getAccessToken();
    if (!token) return false;

    const exp = getTokenExpiration(token);
    if (!exp) return false;

    const now = Math.floor(Date.now() / 1000);
    return exp > now;
}