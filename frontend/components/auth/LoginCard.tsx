"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/constants/app";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { loginWithGoogleIdToken } from "@/services/authService";

function isConfiguredGoogleClientId(googleClientId: string | undefined) {
  return Boolean(
    googleClientId &&
      googleClientId.endsWith(".apps.googleusercontent.com") &&
      !googleClientId.startsWith("replace-with-"),
  );
}

export function LoginCard() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isGoogleOAuthConfigured = isConfiguredGoogleClientId(googleClientId);

  async function handleGoogleLoginSuccess(credentialResponse: CredentialResponse) {
    setLoginErrorMessage(null);

    if (!credentialResponse.credential) {
      setLoginErrorMessage("Google did not return an ID token.");
      return;
    }

    setIsLoginLoading(true);

    try {
      const authSession = await loginWithGoogleIdToken(credentialResponse.credential);
      signIn(authSession);
      toast.success("Signed in successfully.");
      router.replace(ROUTES.dashboard);
    } catch {
      setLoginErrorMessage("Google sign-in failed. Please try again with an authorized account.");
    } finally {
      setIsLoginLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,82,255,0.24),rgba(15,23,42,0)_42%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]" />
      <Card className="relative w-full max-w-md border-white/15 bg-white/95 shadow-2xl shadow-blue-950/30">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="gradient-primary rounded-md p-2 text-primary-foreground shadow-lg shadow-blue-500/25">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <CardTitle className="text-xl">{APP_NAME}</CardTitle>
                <CardDescription>Accounting AI Document Processing</CardDescription>
              </div>
            </div>
            <Badge variant="secondary">SSO</Badge>
          </div>
          <div>
            <h1 className="text-3xl font-black leading-tight text-foreground">Sign in to your workspace</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use your Google account to access protected accounting workflows.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isGoogleOAuthConfigured ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Google OAuth is not configured. Set a real NEXT_PUBLIC_GOOGLE_CLIENT_ID.
            </div>
          ) : null}

          <div className="flex min-h-11 justify-center">
            {isLoginLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Signing in...
              </div>
            ) : !isGoogleOAuthConfigured ? (
              <div className="rounded-md border border-border bg-muted px-4 py-2 text-sm text-muted-foreground">
                Google sign-in is waiting for OAuth configuration.
              </div>
            ) : (
              <GoogleLogin
                onError={() => setLoginErrorMessage("Google sign-in was cancelled or failed.")}
                onSuccess={handleGoogleLoginSuccess}
                shape="rectangular"
                size="large"
                text="continue_with"
                theme="outline"
                width="320"
              />
            )}
          </div>

          {loginErrorMessage ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {loginErrorMessage}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
