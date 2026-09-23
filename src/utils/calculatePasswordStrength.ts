// Scores a password 0-100 in four equal-weighted 25-point checks: length >= 8, an uppercase
// letter, a lowercase letter, and a digit/special character. Shared by SignupPage and
// ResetPasswordPage, which both render the same strength meter.
export const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;

  let strength = 0;

  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[a-z]/.test(password)) strength += 25;
  if (/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 25;

  return strength;
};
