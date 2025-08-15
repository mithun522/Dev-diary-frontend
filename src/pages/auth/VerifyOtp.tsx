import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { unstable_OneTimePasswordField as OneTimePasswordField } from "radix-ui";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { logger } from "../../utils/logger";
import axios from "axios";
import { VERIFY_OTP } from "../../constants/Api";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from state or use a placeholder
  const params = new URLSearchParams(location.search);
  const email = params.get("email") || "user@example.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 4) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(VERIFY_OTP, {
        email: email,
        otp,
      });

      if (response.status === 200) {
        toast.success("OTP verified successfully");
        navigate("/auth/reset-password", { state: { email } });
      }
    } catch (error) {
      const err = error as AxiosError;

      toast.error(
        (err.response?.data as { message: string }).message ||
          "Failed to verify OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      // TODO: Replace with resend OTP API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("A new OTP has been sent to your email");
    } catch (error) {
      logger.error(error);
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Verify OTP</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <OneTimePasswordField.Root
                className="flex justify-left items-center gap-2"
                value={otp}
                onValueChange={(e) => setOtp(e)}
              >
                {Array.from({ length: 4 }).map((_, index) => (
                  <OneTimePasswordField.Input
                    key={index}
                    className="w-12 h-12 rounded-md border border-input text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                  />
                ))}
                <OneTimePasswordField.HiddenInput />
              </OneTimePasswordField.Root>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Verifying...
                </span>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={handleResendOTP}
                className="text-sm"
                disabled={isLoading}
              >
                Didn't receive the code? Resend
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <a href="/auth/login" className="text-primary hover:underline">
              Back to Login
            </a>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};

export default VerifyOTPPage;
