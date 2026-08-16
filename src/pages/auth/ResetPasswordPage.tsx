import { useState, useEffect } from "react";
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
import { Progress } from "../../components/ui/progress";
import axios, { type AxiosError } from "axios";
import { toast } from "react-toastify";
import { RESET_PASSWORD } from "../../constants/Api";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";
  const navigate = useNavigate();

  useEffect(() => {
    if (!email || !otp) {
      navigate("/auth/forgot-password");
    }
  }, [email, otp, navigate]);

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 25;

    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 25;

    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25;

    // Contains number or special character
    if (/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 25;

    return strength;
  };

  // Update strength when password changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const getPasswordStrengthText = (): { text: string; color: string } => {
    if (passwordStrength <= 25)
      return { text: "Weak", color: "text-destructive" };
    if (passwordStrength <= 50)
      return { text: "Fair", color: "text-amber-500" };
    if (passwordStrength <= 75) return { text: "Good", color: "text-blue-500" };
    return { text: "Strong", color: "text-green-500" };
  };

  const getProgressColor = (): string => {
    if (passwordStrength <= 25) return "bg-destructive";
    if (passwordStrength <= 50) return "bg-amber-500";
    if (passwordStrength <= 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordStrength < 50) {
      setError("Please use a stronger password");
      return;
    }

    setError(null);
    try {
      setIsLoading(true);
      await axios.post(RESET_PASSWORD, { email, otp, newPassword: password });
      toast.success("Password reset successfully");
      navigate("/auth/login?reset=success");
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(
        (axiosError.response?.data as { message?: string })?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const strengthInfo = getPasswordStrengthText();

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl" data-cy="reset-password-title">
            Reset Password
          </CardTitle>
          <CardDescription>
            Create a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="bg-destructive/15 text-destructive text-sm p-3 rounded-md"
                data-cy="reset-password-error"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <p className="p-2 bg-muted rounded-md text-sm">{email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                data-cy="reset-password-password"
              />
              {password && (
                <div className="mt-2" data-cy="reset-password-strength">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Password strength</span>
                    <span className={strengthInfo.color}>
                      {strengthInfo.text}
                    </span>
                  </div>
                  <Progress
                    value={passwordStrength}
                    className="h-1"
                    indicatorClassName={getProgressColor()}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-cy="reset-password-confirm-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-cy="reset-password-submit"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
