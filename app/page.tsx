import Link from "next/link";
import { RedirectAuthenticatedUser } from "@/components/redirect-authenticated-user";
import { ModeToggle } from "@/components/ui/dark-light-mode";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  FileCheck2,
  FileText,
  Globe2,
  Layers3,
  LockKeyhole,
  MousePointer2,
  Palette,
  Plus,
  Share2,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: MousePointer2,
    title: "Build visually",
    description:
      "Start with a blank canvas or a template, then arrange questions in a simple drag-and-drop workflow.",
    tone: "bg-orange-100 text-orange-700",
  },
  {
    icon: Palette,
    title: "Make it yours",
    description:
      "Customize colors, typography, spacing, and your brand details so every form feels like your product.",
    tone: "bg-violet-100 text-violet-700",
  },
  {
    icon: BarChart3,
    title: "Understand every response",
    description:
      "See submissions in one place, follow response trends, and turn collected answers into useful insights.",
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Share2,
    title: "Share anywhere",
    description:
      "Publish a shareable link, embed a form on your site, or send it directly to your audience.",
    tone: "bg-sky-100 text-sky-700",
  },
  {
    icon: LockKeyhole,
    title: "Collect with confidence",
    description:
      "Choose what to ask and keep your workspace organized as your forms and response volume grow.",
    tone: "bg-amber-100 text-amber-700",
  },
  {
    icon: Zap,
    title: "Skip repetitive work",
    description:
      "Reuse templates and question patterns to create a polished first draft in less time.",
    tone: "bg-rose-100 text-rose-700",
  },
];

const templates = [
  {
    category: "Customer experience",
    title: "Customer feedback",
    detail: "Learn what customers love and where you can improve.",
    color: "from-orange-100 to-amber-50",
    badge: "bg-orange-500",
    questions: ["How was your experience?", "What could we do better?"],
  },
  {
    category: "People & culture",
    title: "Employee pulse",
    detail: "Check in with your team and make space for honest feedback.",
    color: "from-violet-100 to-fuchsia-50",
    badge: "bg-violet-500",
    questions: ["How are you feeling this week?", "I feel supported by my team"],
  },
  {
    category: "Events",
    title: "Event registration",
    detail: "Collect attendee details and make sign-ups effortless.",
    color: "from-emerald-100 to-teal-50",
    badge: "bg-emerald-500",
    questions: ["Your name", "Which session will you attend?"],
  },
];

const steps = [
  {
    number: "01",
    title: "Start with a goal",
    description:
      "Choose a template or start fresh. Decide what you need to learn, register, or organize.",
  },
  {
    number: "02",
    title: "Shape your form",
    description:
      "Add questions, arrange the flow, and style the experience to match your brand.",
  },
  {
    number: "03",
    title: "Share and learn",
    description:
      "Publish your form, invite responses, and use your dashboard to see what comes back.",
  },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#faf9f7] pt-[72px] text-zinc-900">
      <RedirectAuthenticatedUser />
      <header className="fixed inset-x-0 top-0 z-30 border-b border-zinc-200/80 bg-[#faf9f7]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Formcraft home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-orange-600 text-white">
              <FileText size={19} />
            </span>
            <span className="text-lg font-bold tracking-tight">Formcraft</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-zinc-600 hover:text-zinc-950">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-zinc-600 hover:text-zinc-950">
              How it works
            </Link>
            <Link href="#templates" className="text-sm font-medium text-zinc-600 hover:text-zinc-950">
              Templates
            </Link>
            <Link href="#faq" className="text-sm font-medium text-zinc-600 hover:text-zinc-950">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
            >
              Get started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-6 pb-20 pt-16 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28">
        <div className="pointer-events-none absolute -right-48 -top-40 size-[540px] rounded-full bg-orange-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -left-52 top-64 size-[400px] rounded-full bg-amber-100/50 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-orange-800 shadow-sm">
              <Sparkles size={14} />
              A clearer way to collect what matters
            </div>
            <h1 className="max-w-[680px] text-5xl font-bold leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-[4.25rem]">
              Forms that feel
              <span className="block text-orange-600">easy to make.</span>
              <span className="block">Easy to answer.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8">
              Create thoughtful forms, surveys, and sign-up flows without the
              busywork. Bring your questions together, share them anywhere, and
              make better decisions with every response.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-orange-600 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-600/15 transition-all hover:-translate-y-0.5 hover:bg-orange-700"
              >
                Create your first form <ArrowRight size={16} />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                See how it works <ChevronDown size={15} />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-600" /> No code required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-600" /> Start in minutes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-600" /> Simple to share
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[570px] lg:ml-auto">
            <div className="absolute -right-5 top-16 h-64 w-64 rounded-full bg-orange-200/50 blur-3xl" />
            <div className="relative rotate-[1deg] rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-[0_28px_90px_-35px_rgba(39,39,42,0.35)] sm:p-4">
              <div className="flex items-center justify-between border-b border-zinc-100 px-2 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                    <FileText size={14} />
                  </span>
                  <span className="text-xs font-semibold">Customer feedback</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    Published
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Saved
                </div>
              </div>

              <div className="grid min-h-[370px] grid-cols-[104px_1fr] sm:grid-cols-[128px_1fr]">
                <div className="border-r border-zinc-100 py-4 pr-3">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <span className="text-[10px] font-semibold text-zinc-600">Questions</span>
                    <Plus size={12} className="text-zinc-400" />
                  </div>
                  {["Welcome", "Rating", "Feedback", "Email"].map((item, index) => (
                    <div
                      key={item}
                      className={`mb-1 flex items-center gap-2 rounded-md px-2 py-2 text-[10px] ${
                        index === 1
                          ? "border border-orange-200 bg-orange-50 font-semibold text-orange-800"
                          : "text-zinc-500"
                      }`}
                    >
                      <span className="text-[9px] text-zinc-400">⋮⋮</span>
                      {item}
                    </div>
                  ))}
                  <div className="mt-3 flex items-center gap-1.5 px-2 text-[10px] font-medium text-orange-700">
                    <Plus size={12} /> Add question
                  </div>
                </div>

                <div className="bg-[#faf9f7] p-4 sm:p-6">
                  <div className="mx-auto max-w-[300px] rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-4 h-20 rounded-lg bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100 p-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-white/80 text-orange-700">
                        <Sparkles size={15} />
                      </div>
                    </div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-orange-600">
                      Customer feedback
                    </p>
                    <h3 className="mt-1.5 text-base font-bold tracking-tight">
                      We&apos;d love your feedback
                    </h3>
                    <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                      Your thoughts help us make every experience better.
                    </p>
                    <div className="mt-5 rounded-lg border border-orange-300 bg-orange-50/50 p-3 ring-2 ring-orange-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold">
                          How was your experience?
                        </span>
                        <span className="rounded bg-orange-100 px-1 py-0.5 text-[8px] font-semibold text-orange-700">
                          Required
                        </span>
                      </div>
                      <div className="mt-3 flex justify-between">
                        {["😞", "🙁", "😐", "🙂", "🤩"].map((face, index) => (
                          <span
                            key={face}
                            className={`flex size-8 items-center justify-center rounded-md text-sm ${
                              index === 4
                                ? "border border-orange-300 bg-white shadow-sm"
                                : "bg-white"
                            }`}
                          >
                            {face}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-zinc-200 p-3">
                      <span className="text-[10px] font-semibold">
                        What could we do better?
                      </span>
                      <div className="mt-2 h-7 rounded border border-zinc-100 bg-zinc-50" />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[9px] text-zinc-400">1 of 4</span>
                      <span className="rounded-md bg-orange-600 px-3 py-1.5 text-[9px] font-semibold text-white">
                        Continue →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-100 px-2 pt-3 text-[10px] text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 size={12} /> Anyone with the link
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={12} /> Updated just now
                </span>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg sm:flex">
              <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <BarChart3 size={18} />
              </span>
              <span>
                <span className="block text-xs font-semibold">Responses are in</span>
                <span className="mt-0.5 block text-[10px] text-zinc-500">128 people responded</span>
              </span>
              <span className="ml-1 text-xs font-semibold text-emerald-700">+18%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white/70 px-6 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Everything you need to go from question to insight
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-semibold text-zinc-500">
            <span className="inline-flex items-center gap-2"><WandSparkles size={16} /> Flexible builder</span>
            <span className="inline-flex items-center gap-2"><Layers3 size={16} /> Ready-made templates</span>
            <span className="inline-flex items-center gap-2"><BarChart3 size={16} /> Response insights</span>
            <span className="inline-flex items-center gap-2"><Code2 size={16} /> Easy to embed</span>
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-orange-700">Everything in one workspace</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Less setup. Better questions.{" "}
              <span className="text-zinc-400">More useful answers.</span>
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-600">
              Formcraft gives you the building blocks to create a great form,
              share it with the right people, and make sense of what they tell you.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description, tone }) => (
              <article
                key={title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-900/5"
              >
                <span className={`flex size-11 items-center justify-center rounded-xl ${tone}`}>
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-zinc-200 bg-white px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-lg">
            <p className="text-sm font-semibold text-orange-700">A simple process</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              From first draft to finished form.
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-600">
              Keep your workflow focused. Start with the outcome you want, build
              just what you need, and get your form in front of people.
            </p>
            <Link
              href="/signup"
              className="mt-7 inline-flex h-11 items-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Try the builder <ArrowRight size={15} />
            </Link>
          </div>
          <div className="space-y-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="grid gap-4 rounded-2xl border border-zinc-200 bg-[#faf9f7] p-5 sm:grid-cols-[54px_1fr] sm:gap-5 sm:p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-orange-700 shadow-sm">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-zinc-500">{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-orange-700">A head start for every idea</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Start with a template.{" "}
                <span className="text-zinc-400">Make it your own.</span>
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-600">
                Begin with a proven structure for common use cases, then
                customize every question and detail for your needs.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 pb-1 text-sm font-semibold text-orange-700 hover:text-orange-800"
            >
              Explore templates <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {templates.map((template) => (
              <article
                key={template.title}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/5"
              >
                <div className={`h-36 bg-gradient-to-br ${template.color} p-5`}>
                  <div className="flex h-full items-end">
                    <div className="w-full space-y-2 rounded-t-xl border border-white/80 bg-white/80 p-3 shadow-sm backdrop-blur">
                      {template.questions.map((question, index) => (
                        <div key={question} className="flex items-center gap-2">
                          <span className={`size-2 rounded-full ${template.badge}`} />
                          <span className="text-[10px] font-medium text-zinc-600">{question}</span>
                          {index === 0 && <FileCheck2 size={12} className="ml-auto text-zinc-400" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    {template.category}
                  </p>
                  <h3 className="mt-2 font-semibold">{template.title}</h3>
                  <p className="mt-1.5 min-h-10 text-sm leading-5 text-zinc-500">{template.detail}</p>
                  <Link
                    href="/signup"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 hover:text-orange-800"
                  >
                    Use this template <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-zinc-900 px-6 py-12 text-white sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-10 -top-32 size-96 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-orange-300">Your next great question starts here</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Make room for better answers.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-300 sm:text-base">
                Create a form that works for your team, your customers, or your
                next big idea. Start building at your own pace.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
            >
              Get started for free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-zinc-200 bg-white px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-sm font-semibold text-orange-700">Good to know</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Have another question?{" "}
              <Link href="mailto:hello@formcraft.example" className="font-semibold text-orange-700 hover:underline">
                Get in touch
              </Link>
              .
            </p>
          </div>
          <div className="divide-y divide-zinc-200">
            <Faq
              question="What can I create with Formcraft?"
              answer="Use the builder to make forms for feedback, event registration, onboarding, surveys, sign-ups, and other workflows where you need to collect structured answers."
            />
            <Faq
              question="Do I need to know how to code?"
              answer="No. The product is designed around a visual form-building workflow. You can add and organize questions, customize the presentation, and share your form without writing code."
            />
            <Faq
              question="How do people respond to my form?"
              answer="Once published, a form can be shared using its link. You can also embed it in a website as that feature becomes available in your workspace."
            />
            <Faq
              question="Where can I see the responses?"
              answer="Responses are intended to be managed from your dashboard, alongside your forms. The landing page demonstrates the product direction; specific response features depend on what you implement in the app."
            />
          </div>
        </div>
      </section>

      <footer className="bg-white px-6 pb-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 border-t border-zinc-200 pt-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-orange-600 text-white">
              <FileText size={14} />
            </span>
            <span className="text-sm font-bold">Formcraft</span>
          </Link>
          <p className="text-xs text-zinc-500">
            A calmer way to make forms and learn from every response.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
            <Link href="/login" className="hover:text-zinc-900">Log in</Link>
            <Link href="/signup" className="hover:text-zinc-900">Create account</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:hidden">
        {question}
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-transform group-open:rotate-180">
          <ChevronDown size={15} />
        </span>
      </summary>
      <p className="mt-3 max-w-2xl pr-10 text-sm leading-6 text-zinc-500">{answer}</p>
    </details>
  );
}
