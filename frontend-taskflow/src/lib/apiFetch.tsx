// src/lib/apiFetch.ts
export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, {
    ...init,
    credentials: "include", // ✅ always send cookies
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  return res;
}
