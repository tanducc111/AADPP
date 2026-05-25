import axios, { AxiosError, type AxiosInstance } from "axios";

import { LOCAL_STORAGE_ACCESS_TOKEN_KEY } from "@/constants/app";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

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

  const accessToken = window.localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);

  if (accessToken) {
    requestConfig.headers.Authorization = `Bearer ${accessToken}`;
  }

  return requestConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  (apiError: AxiosError) => Promise.reject(apiError),
);
