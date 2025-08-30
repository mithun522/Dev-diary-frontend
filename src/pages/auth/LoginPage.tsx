import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "react-toastify";
import AuthLayout from "../../components/layout/AuthLayout";
import axios, { AxiosError } from "axios";
import { LOGIN } from "../../constants/Api";
import { setAccessToken } from "../../utils/auth";
import {
  ENTER_EMAIL_AND_PASSWORD,
  LOGIN_SUCCESSFUL,
} from "../../constants/ToastMessage";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginFromWelcome, setLoginFromWelcome] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(ENTER_EMAIL_AND_PASSWORD);
      return;
    }

    try {
      setIsLoading(true);
      const request = { email, password };
      const response = await axios.post(LOGIN, request);

      if (response.data.message?.toLowerCase() === "login successful") {
        setAccessToken(response.data.token);
        navigate("/dsa");
        toast.success(LOGIN_SUCCESSFUL);
      }
    } catch (error) {
      const err = error as AxiosError;

      if (err.response) {
        const serverMessage = (err.response.data as { message?: string })
          ?.message;
        toast.error(serverMessage || "Something went wrong");
      } else if (err.request) {
        toast.error(
          "Cannot connect to server. Please check if backend is running."
        );
      } else {
        toast.error(err.message || "Unexpected error occurred");
      }
    } finally {
      setIsLoading(false); // ✅ Spinner stops
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromUrl = params.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      setLoginFromWelcome(true);
    }
  }, [location.search]);

  return (
    <AuthLayout>
      <Card className="bg-gray-50 dark:bg-background">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                data-cy="login-email"
                id="email"
                type="email"
                placeholder="johndoe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || loginFromWelcome}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  data-cy="login-forgot-password"
                  to="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                data-cy="login-password"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="remember-me" className="text-sm font-normal">
                Remember me
              </Label>
            </div>

            <Button
              data-cy="login-button"
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
              onClick={(e) => handleSubmit(e)}
            >
              {isLoading ? (
                <span
                  className="flex items-center gap-2"
                  data-cy="login-spinner"
                >
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>

            <div className="relative my-6">
              <div className="relative flex justify-center text-xs uppercase">
                <hr className="absolute top-1/2 w-full left-0 border-gray-300" />
                <span className="bg-card px-2 text-muted-foreground relative z-10">
                  Demo Mode
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                For demo purposes, you can log in with any valid email and
                password.
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="text-primary hover:underline"
              data-cy="login-signup"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};

export default LoginPage;
