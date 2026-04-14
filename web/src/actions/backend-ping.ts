"use server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.100.7:8080/api";

export async function pingBackendAction() {
  try {
    const res = await fetch(`${API_URL}/auth/status`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const text = await res.text();
      if (text.trim() === "Ready") {
        return { isReady: true };
      }
    }

    return { isReady: false };
  } catch (error) {
    return { isReady: false };
  }
}
