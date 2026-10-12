"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { getPasswordStrength } from "@/utils/password-strength";

const strengthStyles = {
  weak: {
    label: "Weak",
    bar: "bg-red-500",
    text: "text-red-600",
  },
  medium: {
    label: "Medium",
    bar: "bg-amber-500",
    text: "text-amber-700",
  },
  high: {
    label: "High",
    bar: "bg-emerald-600",
    text: "text-emerald-700",
  },
} as const;

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordStrength = getPasswordStrength(password);
  const strengthStyle = strengthStyles[passwordStrength];
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (passwordStrength === "weak") {
      setError("Choose a password with at least medium strength.");
      return;
    }
    if (!passwordsMatch) {
      setError("Make sure both passwords match.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, confirmPassword }),
      });
      const result = (await response.json()) as {
        success: boolean;
        message: string;
      };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create account");
      }
      router.push("/login");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create account",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                minLength={8}
                maxLength={72}
                required
              />
              {password.length > 0 && (
                <div
                  className="mt-2 space-y-1.5"
                  aria-live="polite"
                  aria-label={`Password strength: ${strengthStyle.label}`}
                >
                  <div
                    className="grid grid-cols-3 gap-1"
                    role="img"
                    aria-label={`Password strength ${strengthStyle.label}`}
                  >
                    {(["weak", "medium", "high"] as const).map((level) => {
                      const strengthOrder = {
                        weak: 1,
                        medium: 2,
                        high: 3,
                      } as const;
                      const isActive =
                        strengthOrder[level] <= strengthOrder[passwordStrength];
                      return (
                        <span
                          key={level}
                          className={`h-1.5 rounded-full ${
                            isActive ? strengthStyle.bar : "bg-zinc-200"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className={`text-xs font-medium ${strengthStyle.text}`}>
                    Password strength: {strengthStyle.label}
                  </p>
                </div>
              )}
              <FieldDescription>
                Use at least 8 characters and 3 of these: lowercase, uppercase,
                number, or symbol. For high strength, use at least 12 characters
                and all 4.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                minLength={8}
                maxLength={72}
                aria-invalid={passwordMismatch}
                required
              />
              {passwordMismatch ? (
                <FieldDescription className="text-red-600" aria-live="polite">
                  Passwords do not match.
                </FieldDescription>
              ) : passwordsMatch ? (
                <FieldDescription className="text-emerald-700" aria-live="polite">
                  Passwords match.
                </FieldDescription>
              ) : (
                <FieldDescription>
                  Enter the same password again to confirm it.
                </FieldDescription>
              )}
            </Field>
            <FieldGroup>
              <Field>
                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !passwordsMatch ||
                    passwordStrength === "weak"
                  }
                >
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
                <Button variant="outline" type="button">
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account?
                  <Link href="/login">Sign In</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

// Alternate way to collect form data:

// Way No 1: using useState
// import { useState } from "react"

// type FormValues = {
//   name: string
//   email: string
//   password: string
//   confirmPassword: string
// }

// export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
//   const [formValues, setFormValues] = useState<FormValues>({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   })

//   function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
//     const { name, value } = event.target

//     setFormValues((previousValues) => ({
//       ...previousValues,
//       [name]: value,
//     }))
//   }

//   function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//     event.preventDefault()
//     console.log(formValues)
//   }

//   // ...
// }

// <Input
//   id="name"
//   name="name"
//   value={formValues.name}
//   onChange={handleChange}
//   type="text"
//   required
// />

// Way No 2:

// function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//   event.preventDefault()

//   const form = event.currentTarget

//   const name = (form.elements.namedItem("name") as HTMLInputElement).value
//   const email = (form.elements.namedItem("email") as HTMLInputElement).value
//   const password = (form.elements.namedItem("password") as HTMLInputElement).value
//   const confirmPassword = (
//     form.elements.namedItem("confirmPassword") as HTMLInputElement
//   ).value

//   console.log({ name, email, password, confirmPassword })
// }

// Way No 3: Browser built-in i.e new FormData(event.currentTarget)

// function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//   event.preventDefault()
//   const formData = new FormData(event.currentTarget)
//   const values = Object.fromEntries(formData.entries())
//   console.log(values)
// }

// Way No 4: React Hook Form

// npm install react-hook-form
// import { useForm, SubmitHandler } from "react-hook-form"

// type Inputs = {
//   example: string
//   exampleRequired: string
// }

// export default function App() {
//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm<Inputs>()
//   const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)

//   console.log(watch("example")) // watch input value by passing its name

//   return (
//     /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
//     <form onSubmit={handleSubmit(onSubmit)}>
//       {/* register your input into the hook by invoking the "register" function */}
//       <input defaultValue="test" {...register("example")} />

//       {/* include validation with required or other standard HTML validation rules */}
//       <input {...register("exampleRequired", { required: true })} />
//       {/* errors will return when field validation fails  */}
//       {errors.exampleRequired && <span>This field is required</span>}

//       <input type="submit" />
//     </form>
//   )
// }
