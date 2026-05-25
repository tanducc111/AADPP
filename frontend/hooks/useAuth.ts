"use client";

import { useContext } from "react";

import { AuthContext } from "@/components/providers/AuthProvider";

export function useAuth() {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return authContext;
}
