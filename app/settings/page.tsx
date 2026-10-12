"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ArrowLeft, Check, Monitor, Moon, Sun, UserRound } from "lucide-react";
import { ModeToggle } from "@/components/ui/dark-light-mode";

type Account = {
  fullName: string;
  email: string;
};

type AccountResponse = {
  success: boolean;
  message: string;
  data?: Account;
};

const appearanceOptions = [
  {
    value: "light",
    label: "Light",
    description: "Use the light color theme.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Use the dark color theme.",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Follow your device appearance.",
    icon: Monitor,
  },
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [account, setAccount] = useState<Account | null>(null);
  const [accountError, setAccountError] = useState("");
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAccount() {
      try {
        const response = await fetch("/api/getme", {
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as AccountResponse;

        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Unable to load account details");
        }
        setAccount(result.data);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Unable to load account settings:", error);
        setAccountError(
          error instanceof Error
            ? error.message
            : "Unable to load account details",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoadingAccount(false);
      }
    }

    void loadAccount();
    return () => controller.abort();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#faf9f7] text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              aria-label="Back to dashboard"
              className="flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <ArrowLeft size={18} />
            </Link>
            <span className="flex size-8 items-center justify-center rounded-lg bg-orange-600 text-white">
              <UserRound size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold">Settings</p>
              <p className="text-xs text-zinc-500">Account and appearance</p>
            </div>
          </div>
          <ModeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-8 px-5 py-9 sm:px-8 sm:py-12">
        <section>
          <p className="text-sm font-semibold text-orange-700">PREFERENCES</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Manage your appearance and view the account currently signed in.
          </p>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
          <div>
            <h2 className="font-semibold">Appearance</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Choose how Formcraft looks. Your preference is saved in this
              browser.
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {appearanceOptions.map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={theme === value}
                className={`flex min-h-24 items-start gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  theme === value
                    ? "border-orange-500 bg-orange-50/50"
                    : "border-zinc-200 hover:border-orange-300 hover:bg-orange-50/50"
                }`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="mt-1 block text-xs leading-5 text-zinc-500">
                    {description}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
            <Check size={14} className="text-emerald-600" />
            Appearance changes are applied immediately.
          </p>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <UserRound size={18} />
            </span>
            <div>
              <h2 className="font-semibold">Account</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Signed-in account details.
              </p>
            </div>
          </div>
          {accountError ? (
            <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {accountError}
            </p>
          ) : isLoadingAccount ? (
            <p role="status" className="mt-5 text-sm text-zinc-500">
              Loading account details…
            </p>
          ) : account ? (
            <dl className="mt-5 grid gap-4 border-t border-zinc-100 pt-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-zinc-500">Name</dt>
                <dd className="mt-1 text-sm font-semibold">{account.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500">Email</dt>
                <dd className="mt-1 break-all text-sm font-semibold">{account.email}</dd>
              </div>
            </dl>
          ) : null}
        </section>

        <p className="text-sm text-zinc-500">
          Need help using Formcraft?{" "}
          <Link
            href="/help"
            className="font-semibold text-orange-700 hover:text-orange-800"
          >
            Visit the Help Center
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
