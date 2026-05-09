export function getStoredAccessToken(): string | null {
  return localStorage.getItem("liais_access_token");
}

export function clearAuthSession() {
  localStorage.removeItem("liais_access_token");
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const accessToken = getStoredAccessToken();
  return {
    ...(extra || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export function jsonHeaders(extra?: HeadersInit): HeadersInit {
  return authHeaders({
    "Content-Type": "application/json",
    ...(extra || {}),
  });
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (response.status === 401 && getStoredAccessToken()) {
    clearAuthSession();
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth?next=${next}`;
  }
  return response;
}
