import type { User } from "./api";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
} as const;

export function getStoredUser(): User | null {
  const userJson = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) !== null;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function getTokenExpiration(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  const exp = getTokenExpiration(token);
  if (!exp) return true;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return nowInSeconds >= exp - bufferSeconds;
}

export function isAccessTokenExpired(bufferSeconds = 30): boolean {
  const token = getAccessToken();
  if (!token) return true;
  return isTokenExpired(token, bufferSeconds);
}
