function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function getToken(cookieName = "jwt") {
  const ss = sessionStorage.getItem("auth_token");
  if (ss) return ss;

  const fromCookie = typeof document !== "undefined" ? getCookie(cookieName) : null;
  return fromCookie || null;
}

export function getUser<T = any>(): T | null {
  const raw = sessionStorage.getItem("auth_user");
  return raw ? (JSON.parse(raw) as T) : null;
}

export function clearSession(cookieName = "jwt") {
  sessionStorage.removeItem("auth_token");
  sessionStorage.removeItem("auth_user");
  if (typeof document !== "undefined") {
    document.cookie = `${cookieName}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}