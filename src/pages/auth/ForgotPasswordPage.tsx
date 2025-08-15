import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import axios, { AxiosError } from "axios";
import { SEND_OTP } from "../../constants/Api";
import { toast } from "react-toastify";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      const response = await axios.post(SEND_OTP, { email: email });
      if (response.status === 200) {
        setEmail(email);
      }
    } catch (error) {
      const err = error as AxiosError;

      toast.error(
        (err.response?.data as { message: string }).message || "Login failed"
      );
    }

    setIsSubmitted(true);
    setError(null);
  };

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="space-y-4">
              <div className="bg-green-500/15 text-green-600 p-4 rounded-md text-sm">
                <p>
                  We've sent a 6-digit code to <strong>{email}</strong>
                </p>
                <p className="mt-2">
                  Please check your email and enter the code on the next screen.
                </p>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Link to={`/auth/verify-otp?email=${email}`}>Enter OTP</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="johndoe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full">
                Send OTP
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/auth/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
