import { cookies } from "next/headers";

const ACCESS_TOKEN_KEY = "admin_access_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";

export async function setTokens(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  // access token 15min
  cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
    ...cookieOptions,
    maxAge: 60 * 60, // 1 hour
  });

  cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_KEY)?.value;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_KEY)?.value;
}

export async function clearTokens() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_KEY);
  cookieStore.delete(REFRESH_TOKEN_KEY);
}
