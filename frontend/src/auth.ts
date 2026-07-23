const TOKEN_KEY = "accessToken";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export interface JwtPayload {
  sub: string;
  role: string;
  name?: string;
  exp: number;
}

export function getUser(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

export function getRole(): string | null {
  return getUser()?.role ?? null;
}

export function getUserName(): string | null {
  return getUser()?.name ?? null;
}
