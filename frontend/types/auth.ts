export type UserRole = "ADMIN" | "ACCOUNTANT";

export type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
};

export type AuthSession = {
  accessToken: string;
  tokenType: "bearer";
  currentUser: AuthenticatedUser;
};

export type AuthenticatedUserApiResponse = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  last_login_at: string | null;
};

export type AuthSessionApiResponse = {
  access_token: string;
  token_type: "bearer";
  user: AuthenticatedUserApiResponse;
};

export type LogoutApiResponse = {
  success: boolean;
  message: string;
};
