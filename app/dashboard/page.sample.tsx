import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Users,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "#dashboard", icon: LayoutDashboard, active: true },
  { label: "My forms", href: "#forms", icon: FileText, active: false },
  { label: "Responses", href: "#responses", icon: Users, active: false },
];

const forms = [
  {
    name: "Customer feedback",
    description: "Customer satisfaction survey",
    updated: "2 hours ago",
    responses: 128,
    status: "Published",
    initials: "CF",
    color: "bg-orange-100 text-orange-700",
  },
  {
    name: "Event registration",
    description: "Product launch RSVP",
    updated: "Yesterday",
    responses: 76,
    status: "Published",
    initials: "ER",
    color: "bg-violet-100 text-violet-700",
  },
  {
    name: "New client onboarding",
    description: "Client intake questionnaire",
    updated: "Oct 6, 2026",
    responses: 0,
    status: "Draft",
    initials: "NC",
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-[#faf9f7] text-zinc-900">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-[250px] flex-col border-r border-zinc-200 bg-white max-md:w-[68px]">
        <Link
          href="#dashboard"
          className="flex h-[72px] items-center gap-3 border-b border-zinc-100 px-5 max-md:justify-center max-md:px-0"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-orange-600 text-white">
            <FileText size={19} />
          </span>
          <span className="text-lg font-bold tracking-tight max-md:hidden">
            Formcraft
          </span>
        </Link>

        <div className="p-4 max-md:px-2">
          <Link
            href="#create-form"
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
            aria-label="Create a form"
          >
            <Plus size={17} />
            <span className="max-md:hidden">Create form</span>
          </Link>
        </div>

        <nav aria-label="Main navigation" className="space-y-1 px-3 max-md:px-2">
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
              }`}
            >
              <Icon size={18} />
              <span className="max-md:hidden">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-1 border-t border-zinc-100 p-3 max-md:px-2">
          <Link
            href="#help"
            aria-label="Help center"
            title="Help center"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 max-md:justify-center max-md:px-0"
          >
            <CircleHelp size={18} />
            <span className="max-md:hidden">Help center</span>
          </Link>
          <Link
            href="#settings"
            aria-label="Settings"
            title="Settings"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 max-md:justify-center max-md:px-0"
          >
            <Settings2 size={18} />
            <span className="max-md:hidden">Settings</span>
          </Link>
          <button
            type="button"
            className="mt-3 flex w-full items-center gap-3 border-t border-zinc-100 px-2 pt-4 text-left max-md:justify-center"
            aria-label="Account menu"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
              A
            </span>
            <span className="min-w-0 flex-1 max-md:hidden">
              <span className="block truncate text-sm font-semibold">Account</span>
              <span className="block truncate text-xs text-zinc-500">
                Personal workspace
              </span>
            </span>
            <ChevronDown size={15} className="text-zinc-400 max-md:hidden" />
          </button>
        </div>
      </aside>

      <main id="dashboard" className="ml-[250px] min-h-screen max-md:ml-[68px]">
        <header className="flex h-[72px] items-center justify-between border-b border-zinc-200 bg-white px-8 max-sm:px-4">
          <div className="text-sm text-zinc-500">
            Workspace <span className="px-2 text-zinc-300">/</span>
            <span className="font-medium text-zinc-900">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Search"
              className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
            >
              <Bell size={18} />
            </button>
            <span className="ml-1 flex size-8 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
              A
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-6xl space-y-8 px-8 py-9 max-sm:px-4 max-sm:py-6">
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-orange-700">
                Friday, October 9, 2026
              </p>
              <h1 className="text-3xl font-bold tracking-tight max-sm:text-2xl">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Here&apos;s what&apos;s happening with your forms.
              </p>
            </div>
            <Link
              href="#create-form"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
            >
              <Plus size={17} />
              Create a form
            </Link>
          </section>

          <section aria-label="Form statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total forms"
              value="12"
              change="+2 this month"
              icon={FileText}
              trend="up"
            />
            <StatCard
              label="Total responses"
              value="1,284"
              change="+18.2% this month"
              icon={Users}
              trend="up"
            />
            <StatCard
              label="Completion rate"
              value="68.4%"
              change="+4.6% this month"
              icon={ArrowUpRight}
              trend="up"
            />
            <StatCard
              label="Avg. completion time"
              value="2m 14s"
              change="12s faster"
              icon={Clock3}
              trend="down"
            />
          </section>

          <section
            id="forms"
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 px-6 py-5 max-sm:px-4">
              <div>
                <h2 className="font-semibold">Recent forms</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  View and manage your latest forms.
                </p>
              </div>
              <Link
                href="#all-forms"
                className="text-sm font-semibold text-orange-700 hover:text-orange-800"
              >
                View all forms
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead>
                  <tr className="bg-zinc-50/70 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    <th className="px-6 py-3 font-medium">Form</th>
                    <th className="px-4 py-3 font-medium">Last updated</th>
                    <th className="px-4 py-3 font-medium">Responses</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-5 py-3" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {forms.map((form) => (
                    <tr key={form.name} className="transition-colors hover:bg-zinc-50/70">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${form.color}`}
                          >
                            {form.initials}
                          </span>
                          <span>
                            <span className="block font-semibold text-zinc-900">
                              {form.name}
                            </span>
                            <span className="mt-0.5 block text-xs text-zinc-500">
                              {form.description}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-zinc-500">{form.updated}</td>
                      <td className="px-4 py-4 font-medium">{form.responses}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            form.status === "Published"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              form.status === "Published"
                                ? "bg-emerald-500"
                                : "bg-zinc-400"
                            }`}
                          />
                          {form.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          aria-label={`More actions for ${form.name}`}
                          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              id="responses"
              className="flex items-center justify-between border-t border-zinc-100 px-6 py-4 text-sm max-sm:px-4"
            >
              <span className="text-zinc-500">Showing 3 of 12 forms</span>
              <Link
                href="#all-forms"
                className="font-semibold text-zinc-700 hover:text-orange-700"
              >
                Browse all <ArrowUpRight size={14} className="ml-1 inline" />
              </Link>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">Keep your workspace organized</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Create a form to start collecting responses from your audience.
                  </p>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                  <FileText size={19} />
                </span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full w-2/3 rounded-full bg-orange-500" />
              </div>
              <div className="mt-2 flex justify-between text-xs text-zinc-500">
                <span>Workspace setup</span>
                <span>2 of 3 complete</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-6">
              <div>
                <h2 className="font-semibold">Need a hand?</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Learn the basics of building your first form.
                </p>
                <Link
                  href="#getting-started"
                  className="mt-4 inline-flex items-center text-sm font-semibold text-orange-700 hover:text-orange-800"
                >
                  Visit the guide <ArrowDownRight size={15} className="ml-1" />
                </Link>
              </div>
              <CircleHelp size={28} className="shrink-0 text-zinc-300" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  change: string;
  icon: typeof FileText;
  trend: "up" | "down";
}) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
        {trend === "up" ? (
          <ArrowUpRight size={14} className="text-emerald-600" />
        ) : (
          <ArrowDownRight size={14} className="text-emerald-600" />
        )}
        <span className="font-medium text-emerald-700">{change}</span>
      </p>
    </article>
  );
}
