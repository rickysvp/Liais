export function getStoredUserId(): string | null {
  return localStorage.getItem("liais_user_id");
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem("liais_access_token");
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const userId = getStoredUserId();
  const accessToken = getStoredAccessToken();
  return {
    ...(extra || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(userId ? { "x-user-id": userId } : {}),
  };
}

export function jsonHeaders(extra?: HeadersInit): HeadersInit {
  return authHeaders({
    "Content-Type": "application/json",
    ...(extra || {}),
  });
}
