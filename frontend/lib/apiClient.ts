import axios, { AxiosError, type AxiosInstance } from "axios";

import { getStoredAccessToken, clearStoredAccessToken } from "@/utils/authStorage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
const LOGIN_PATH = "/login";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.request.use((requestConfig) => {
  if (typeof window === "undefined") {
    return requestConfig;
  }

  const accessToken = getStoredAccessToken();

  if (accessToken) {
    requestConfig.headers.Authorization = `Bearer ${accessToken}`;
  }

  return requestConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  (apiError: AxiosError) => {
    if (apiError.response?.status === 401 && typeof window !== "undefined") {
      clearStoredAccessToken();

      if (window.location.pathname !== LOGIN_PATH) {
        window.location.assign(LOGIN_PATH);
      }
    }

    return Promise.reject(apiError);
  },
);
