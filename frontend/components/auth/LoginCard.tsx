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

export function LoginCard() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-primary p-2 text-primary-foreground">
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
            <h1 className="text-2xl font-semibold text-foreground">Sign in to your workspace</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use your Google account to access protected accounting workflows.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!googleClientId ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Google OAuth is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.
            </div>
          ) : null}

          <div className="flex min-h-11 justify-center">
            {isLoginLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Signing in...
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
