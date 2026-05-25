import { apiClient } from "@/lib/apiClient";
import type {
  AuthenticatedUser,
  AuthenticatedUserApiResponse,
  AuthSession,
  AuthSessionApiResponse,
  LogoutApiResponse,
} from "@/types/auth";

function mapAuthenticatedUser(authenticatedUser: AuthenticatedUserApiResponse): AuthenticatedUser {
  return {
    id: authenticatedUser.id,
    email: authenticatedUser.email,
    fullName: authenticatedUser.full_name,
    avatarUrl: authenticatedUser.avatar_url,
    role: authenticatedUser.role,
    isActive: authenticatedUser.is_active,
    lastLoginAt: authenticatedUser.last_login_at,
  };
}

function mapAuthSession(authSession: AuthSessionApiResponse): AuthSession {
  return {
    accessToken: authSession.access_token,
    tokenType: authSession.token_type,
    currentUser: mapAuthenticatedUser(authSession.user),
  };
}

export async function loginWithGoogleIdToken(idToken: string): Promise<AuthSession> {
  const authResponse = await apiClient.post<AuthSessionApiResponse>("/auth/google", {
    id_token: idToken,
  });

  return mapAuthSession(authResponse.data);
}

export async function getCurrentUserProfile(): Promise<AuthenticatedUser> {
  const currentUserResponse = await apiClient.get<AuthenticatedUserApiResponse>("/auth/me");

  return mapAuthenticatedUser(currentUserResponse.data);
}

export async function logoutAuthenticatedUser(): Promise<LogoutApiResponse> {
  const logoutResponse = await apiClient.post<LogoutApiResponse>("/auth/logout");

  return logoutResponse.data;
}
