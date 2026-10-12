"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ModeToggle } from "@/components/ui/dark-light-mode";
import { FormQrShare } from "@/components/form-qr-share";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
  Users,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  { label: "My forms", href: "/forms", icon: FileText, active: false },
  { label: "Responses", href: "/responses", icon: Users, active: false },
];

type AuthenticatedUser = {
  fullName: string;
  email: string;
};

type GetMeResponse = {
  success: boolean;
  message: string;
  data?: AuthenticatedUser;
};

type FormSummary = {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  responseCount: number;
};

type FormsResponse = {
  success: boolean;
  message: string;
  data?: FormSummary[];
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState("");
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const [formsError, setFormsError] = useState("");
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAuthenticatedUser() {
      try {
        const response = await fetch("/api/getme", {
          method: "GET",
          credentials: "same-origin",
          signal: controller.signal,
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const result = (await response.json()) as GetMeResponse;
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Unable to load your account");
        }

        setUser(result.data);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Unable to load authenticated user:", error);
        setUserError(
          error instanceof Error
            ? error.message
            : "Unable to load your account",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingUser(false);
        }
      }
    }

    void loadAuthenticatedUser();
    return () => controller.abort();
  }, [router]);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadForms() {
      try {
        const response = await fetch("/api/forms", {
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const result = (await response.json()) as FormsResponse;
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Unable to load your forms");
        }

        setForms(result.data);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Unable to load forms:", error);
        setFormsError(
          error instanceof Error ? error.message : "Unable to load your forms",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingForms(false);
        }
      }
    }

    void loadForms();
    return () => controller.abort();
  }, [router]);

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/logout", { method: "POST" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to log out");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError(
        error instanceof Error ? error.message : "Unable to log out",
      );
      setIsLoggingOut(false);
    }
  }

  async function handleDeleteForm(form: FormSummary) {
    if (
      !window.confirm(
        `Delete "${form.title}" and all of its fields? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingFormId(form.id);
    setFormsError("");
    try {
      const response = await fetch(
        `/api/forms/${encodeURIComponent(form.id)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        },
      );
      const result = (await response.json()) as {
        success: boolean;
        message: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete form");
      }

      setForms((currentForms) =>
        currentForms.filter((currentForm) => currentForm.id !== form.id),
      );
    } catch (error) {
      console.error("Unable to delete form:", error);
      setFormsError(
        error instanceof Error ? error.message : "Unable to delete form",
      );
    } finally {
      setDeletingFormId(null);
    }
  }

  const userInitials =
    user?.fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";
  const totalResponses = forms.reduce(
    (total, form) => total + form.responseCount,
    0,
  );
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleForms = normalizedSearchQuery
    ? forms.filter((form) =>
        [form.title, form.description, form.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearchQuery),
      )
    : forms;

  function closeSearch() {
    setIsSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] text-zinc-900">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-[250px] flex-col border-r border-zinc-200 bg-white max-md:w-[68px]">
        <Link
          href="/"
          className="flex h-[72px] items-center gap-3 border-b border-zinc-100 px-5 max-md:justify-center max-md:px-0"
          aria-label="Formcraft dashboard">
          <span className="flex size-9 items-center justify-center rounded-xl bg-orange-600 text-white">
            <FileText size={19} />
          </span>
          <span className="text-lg font-bold tracking-tight max-md:hidden">
            Formcraft
          </span>
        </Link>

        <div className="p-4 max-md:px-2">
          <Link
            href="/forms"
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
            aria-label="Create a form"
            title="Create a form">
            <Plus size={17} />
            <span className="max-md:hidden">Create form</span>
          </Link>
        </div>

        <nav
          aria-label="Workspace navigation"
          className="space-y-1 px-3 max-md:px-2">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 max-md:hidden">
            Workspace
          </p>
          {navigation.map(({ label, href, icon: Icon, active }) => (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              title={label}
              className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors max-md:justify-center max-md:px-0 ${
                active
                  ? "bg-orange-50 text-orange-700"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              }`}>
              <Icon size={18} />
              <span className="max-md:hidden">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-1 border-t border-zinc-100 p-3 max-md:px-2">
          <Link
            href="/help"
            aria-label="Help center"
            title="Help center"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 max-md:justify-center max-md:px-0">
            <CircleHelp size={18} />
            <span className="max-md:hidden">Help center</span>
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            title="Settings"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 max-md:justify-center max-md:px-0">
            <Settings2 size={18} />
            <span className="max-md:hidden">Settings</span>
          </Link>
          <div className="relative mt-3 border-t border-zinc-100 pt-4">
            <button
              type="button"
              onClick={() => setAccountMenuOpen((open) => !open)}
              aria-expanded={accountMenuOpen}
              aria-label="Account menu"
              className="flex w-full items-center gap-3 px-2 text-left max-md:justify-center">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                {userInitials}
              </span>
              <span className="min-w-0 flex-1 max-md:hidden">
                <span className="block truncate text-sm font-semibold">
                  {isLoadingUser
                    ? "Loading account..."
                    : user?.fullName || "Account"}
                </span>
                <span className="block truncate text-xs text-zinc-500">
                  {user?.email || "Personal workspace"}
                </span>
              </span>
              <ChevronDown size={15} className="text-zinc-400 max-md:hidden" />
            </button>
            {accountMenuOpen && (
              <div className="absolute bottom-full left-0 z-30 mb-2 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
                <p className="px-3 py-2 text-xs text-zinc-500">
                  {user?.email || "Your workspace account"}
                </p>
                {userError && (
                  <p role="alert" className="px-3 py-2 text-xs text-red-600">
                    {userError}
                  </p>
                )}
                {logoutError && (
                  <p role="alert" className="px-3 py-2 text-xs text-red-600">
                    {logoutError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50">
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main id="dashboard" className="ml-[250px] min-h-screen max-md:ml-[68px]">
        <header className="flex h-[72px] items-center justify-between border-b border-zinc-200 bg-white px-8 max-sm:px-4">
          <div className="text-sm text-zinc-500">
            Workspace <span className="px-2 text-zinc-300">/</span>
            <span className="font-medium text-zinc-900">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            {isSearchOpen ? (
              <div className="flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10">
                <Search size={16} className="shrink-0 text-zinc-400" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") closeSearch();
                  }}
                  aria-label="Search forms"
                  aria-controls="forms"
                  placeholder="Search forms..."
                  className="w-40 bg-transparent text-sm outline-none placeholder:text-zinc-400 sm:w-56"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="flex size-6 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search forms"
                title="Search forms"
                className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
              >
                <Search size={18} />
              </button>
            )}
            <button
              type="button"
              aria-label="Notifications"
              className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100">
              <Bell size={18} />
            </button>
            <ModeToggle />
            <span
              aria-label={user ? `${user.fullName} account` : "Account"}
              className="ml-1 flex size-8 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
              {userInitials}
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-6xl space-y-8 px-8 py-9 max-sm:px-4 max-sm:py-6">
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-orange-700">
                Your workspace
              </p>
              <h1 className="text-3xl font-bold tracking-tight max-sm:text-2xl">
                {user ? `Welcome, ${user.fullName}` : "Welcome to Formcraft"}
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                {user
                  ? `Signed in as ${user.email}. Create forms, collect responses, and keep everything organized.`
                  : "Create forms, collect responses, and keep everything organized."}
              </p>
            </div>
            <Link
              id="create-form"
              href="/forms"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700">
              <Plus size={17} />
              Create a form
            </Link>
          </section>

          {userError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {userError}
            </p>
          )}

          <section
            aria-label="Workspace overview"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500">Your forms</p>
                <span className="flex size-9 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                  <FileText size={18} />
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight">
                {isLoadingForms ? "…" : forms.length}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Forms created in your workspace
              </p>
            </article>
            <article className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500">Responses</p>
                <span className="flex size-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                  <Users size={18} />
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight">
                {isLoadingForms ? "…" : totalResponses}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Responses collected so far
              </p>
            </article>
            <article className="rounded-xl border border-zinc-200 bg-white p-5 sm:col-span-2 xl:col-span-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500">
                  Workspace status
                </p>
                <span className="size-2 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-4 text-lg font-bold tracking-tight">
                Ready to build
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Start with your first form
              </p>
            </article>
          </section>

          <section
            id="forms"
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 px-6 py-5 max-sm:px-4">
              <div>
                <h2 className="font-semibold">Your forms</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Forms created in your workspace.
                </p>
              </div>
              <Link
                href="/forms"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-600 px-3 text-sm font-semibold text-white hover:bg-orange-700">
                <Plus size={15} />
                Create form
              </Link>
            </div>

            {formsError ? (
              <p role="alert" className="px-6 py-8 text-sm text-red-600">
                {formsError}
              </p>
            ) : isLoadingForms ? (
              <p role="status" className="px-6 py-8 text-sm text-zinc-500">
                Loading your forms…
              </p>
            ) : forms.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                  <FileText size={22} />
                </span>
                <h3 className="mt-4 text-lg font-semibold">
                  Your forms will show up here
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                  Create your first form to start collecting information from
                  customers, teammates, or your community.
                </p>
                <Link
                  href="/forms"
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50">
                  <Plus size={16} />
                  Create your first form
                </Link>
              </div>
            ) : (
              visibleForms.length === 0 ? (
                <p role="status" className="px-6 py-8 text-sm text-zinc-500">
                  No forms match “{searchQuery.trim()}”.
                </p>
              ) : (
              <ul id="dashboard-forms-list" className="divide-y divide-zinc-100">
                {visibleForms.map((form) => (
                  <li
                    key={form.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 max-sm:px-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                        <FileText size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {form.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-zinc-500">
                          {form.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          form.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : form.status === "archived"
                              ? "bg-zinc-100 text-zinc-600"
                              : "bg-amber-50 text-amber-700"
                        }`}>
                        {form.status}
                      </span>
                      <time
                        dateTime={form.updatedAt}
                        className="hidden text-xs text-zinc-500 sm:block">
                        {new Date(form.updatedAt).toLocaleDateString()}
                      </time>
                      <Link
                        href={`/forms?edit=${encodeURIComponent(form.id)}`}
                        aria-label={`Edit ${form.title}`}
                        title="Edit form"
                        className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
                        <Pencil size={15} />
                      </Link>
                      <Link
                        href={`/responses?formId=${encodeURIComponent(form.id)}`}
                        aria-label={`View responses for ${form.title}`}
                        title={`View responses (${form.responseCount})`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-orange-50 hover:text-orange-700">
                        <MessageSquareText size={15} />
                        <span>{form.responseCount}</span>
                      </Link>
                      {form.status === "published" && (
                        <>
                          <FormQrShare
                            formId={form.id}
                            formTitle={form.title}
                          />
                          <Link
                            href={`/respond/${encodeURIComponent(form.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open public form ${form.title}`}
                            title="Open public form"
                            className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
                            <ExternalLink size={15} />
                          </Link>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteForm(form)}
                        disabled={deletingFormId === form.id}
                        aria-label={`Delete ${form.title}`}
                        title="Delete form"
                        className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-50">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              )
            )}
          </section>

          <div id="responses" className="sr-only">
            Responses will appear here when your forms receive submissions.
          </div>
        </div>
      </main>
    </div>
  );
}
