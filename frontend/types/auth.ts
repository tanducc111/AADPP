export type UserRole = "ADMIN" | "ACCOUNTANT";

export type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type AuthSession = {
  accessToken: string;
  tokenType: "bearer";
  currentUser: AuthenticatedUser;
};
