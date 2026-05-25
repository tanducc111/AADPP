import { AxiosError } from "axios";

type ApiErrorResponse = {
  message?: string;
};

export function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof AxiosError) {
    const errorResponse = error.response?.data as ApiErrorResponse | undefined;

    return errorResponse?.message ?? fallbackMessage;
  }

  return fallbackMessage;
}
