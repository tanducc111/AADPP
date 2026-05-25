import { apiClient } from "@/lib/apiClient";
import type { HealthCheckResponse } from "@/types/health";

export async function getBackendHealth(): Promise<HealthCheckResponse> {
  const healthResponse = await apiClient.get<HealthCheckResponse>("/health");

  return healthResponse.data;
}
