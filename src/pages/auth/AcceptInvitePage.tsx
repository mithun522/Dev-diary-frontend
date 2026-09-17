import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { isAdmin, isSuperAdmin, setAccessToken } from "../../utils/auth";
import { useAuthStore } from "../../store/AuthStore";
import { useAcceptInvite } from "../../api/hooks/useInvites";
import Seo from "../../components/Seo";

// Matches auth-service's inviteService.js::buildActivationLink exactly — the backend hardcodes
// `${FRONTEND_BASE_URL}/activate-account?token=...` in every invite email, so this route path is
// not just a naming choice, it's the literal link candidates receive.
const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const acceptInviteMutation = useAcceptInvite();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("This invite link is missing its token.");
      return;
    }
    if (!firstName || !lastName || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setError(null);
    acceptInviteMutation.mutate(
      { token, firstName, lastName, password },
      {
        onSuccess: (result) => {
          setAccessToken(result.token);
          useAuthStore.getState().setAuth(result.token);
          toast.success("Account activated");
          navigate(isSuperAdmin() ? "/super-admin/invites" : isAdmin() ? "/admin" : "/dsa");
        },
        onError: (err) => {
          const axiosError = err as AxiosError;
          setError(
            (axiosError.response?.data as { message?: string })?.message ||
              "This invite link is invalid or has expired."
          );
        },
      }
    );
  };

  return (
    <AuthLayout>
      <Seo title="Accept Invite" path="/activate-account" noindex />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl" data-cy="accept-invite-title">
            Activate Your Account
          </CardTitle>
          <CardDescription>
            Set your name and password to finish setting up your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="bg-destructive/15 text-destructive text-sm p-3 rounded-md"
                data-cy="accept-invite-error"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                data-cy="accept-invite-first-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                data-cy="accept-invite-last-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-cy="accept-invite-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-cy="accept-invite-confirm-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={acceptInviteMutation.isPending}
              data-cy="accept-invite-submit"
            >
              {acceptInviteMutation.isPending ? "Activating..." : "Activate Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default AcceptInvitePage;
