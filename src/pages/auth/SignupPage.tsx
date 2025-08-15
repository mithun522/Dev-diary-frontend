import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Progress } from "../../components/ui/progress";
import { toast } from "react-toastify";
import axios, { AxiosError } from "axios";
import { REGISTER } from "../../constants/Api";
import {
  REGISTER_SUCCESSFUL,
  REGISTRATION_FAILED,
} from "../../constants/ToastMessage";
import { FIRST_NAME_REQUIRED } from "../../constants/ErrorMessage";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignupPage = () => {
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 25;

    return strength;
  };

  // Handle form field changes
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    await setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
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
    const { firstName, lastName, email, password, confirmPassword } = form;

    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    let hasError = false;

    if (!firstName.trim()) {
      newErrors.firstName = FIRST_NAME_REQUIRED;
      hasError = true;
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
      hasError = true;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      hasError = true;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
      hasError = true;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    if (password && passwordStrength < 50) {
      newErrors.password = "Please use a stronger password";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    const requestBody = {
      firstName,
      lastName,
      email,
      password,
    };

    try {
      setIsLoading(true);
      const response = await axios.post(REGISTER, requestBody);

      if (response.status === 200) {
        toast.success(REGISTER_SUCCESSFUL);
        setTimeout(() => {
          navigate("/auth/login");
        }, 1000);
      } else {
        toast.error(REGISTRATION_FAILED);
      }
    } catch (error) {
      const err = error as AxiosError;
      toast.error(
        (err.response?.data as { message: string })?.message ||
          REGISTRATION_FAILED
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
          <CardTitle className="text-2xl" data-cy="register-title">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            data-cy="register-form"
          >
            <div className="space-y-2">
              <Label htmlFor="firstName" isMandatory={true}>
                First Name
              </Label>
              <Input
                data-cy="register-first-name"
                id="firstName"
                name="firstName"
                placeholder="Enter your first name"
                value={form.firstName}
                onChange={handleChange}
                disabled={isLoading}
                error={errors.firstName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" isMandatory={true}>
                Last Name
              </Label>
              <Input
                data-cy="register-last-name"
                id="lastName"
                name="lastName"
                placeholder="Enter your last name"
                value={form.lastName}
                onChange={handleChange}
                disabled={isLoading}
                error={errors.lastName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" isMandatory={true}>
                Email
              </Label>
              <Input
                data-cy="register-email"
                id="email"
                name="email"
                type="email"
                placeholder="johndoe@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={isLoading}
                error={errors.email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" isMandatory={true}>
                Password
              </Label>
              <Input
                data-cy="register-password"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                disabled={isLoading}
                error={errors.password}
              />
              {form.password && (
                <div className="mt-2">
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
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                data-cy="register-confirm-password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                error={errors.confirmPassword}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-cy="register-button"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    data-cy="register-creating-account"
                  />
                  Creating account...
                </span>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-primary hover:underline"
              data-cy="register-loginButton"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};

export default SignupPage;
