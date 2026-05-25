import { LOCAL_STORAGE_ACCESS_TOKEN_KEY } from "@/constants/app";

export function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(accessToken: string) {
  window.localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, accessToken);
}

export function clearStoredAccessToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
}
