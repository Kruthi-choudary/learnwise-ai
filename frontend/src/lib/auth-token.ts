// Real-account session token, as opposed to the anonymous per-browser id in
// student-id.ts used by Demo mode. Stored client-side only (localStorage) —
// this is still a frontend-only session, just a real one backed by the API.
const TOKEN_KEY = "learnwise.authToken";
const DEMO_KEY = "learnwise.demoMode";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getDemoMode(): boolean {
  return localStorage.getItem(DEMO_KEY) === "1";
}

export function setDemoMode(on: boolean): void {
  if (on) localStorage.setItem(DEMO_KEY, "1");
  else localStorage.removeItem(DEMO_KEY);
}
