export type PasswordStrength = "weak" | "medium" | "high";

export function getPasswordStrength(password: string): PasswordStrength {
  const characterTypes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (password.length >= 12 && characterTypes === 4) return "high";
  if (password.length >= 8 && characterTypes >= 3) return "medium";
  return "weak";
}
