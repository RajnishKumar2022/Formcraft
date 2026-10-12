"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CircleHelp,
  FilePlus2,
  MessageSquareText,
  QrCode,
  Settings2,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/dark-light-mode";

const helpTopics = [
  {
    icon: FilePlus2,
    title: "Create and publish a form",
    description:
      "Start a form, add questions, then set its status to Published when it is ready for customers.",
    href: "/forms",
    action: "Go to form builder",
  },
  {
    icon: QrCode,
    title: "Share a form with customers",
    description:
      "From the dashboard, use the QR-code button beside a published form to show or download its QR code and copy the public link.",
    href: "/dashboard#forms",
    action: "Open your forms",
  },
  {
    icon: MessageSquareText,
    title: "Review submitted responses",
    description:
      "Open Responses from the sidebar to choose a form and review the answers customers have submitted.",
    href: "/responses",
    action: "View responses",
  },
  {
    icon: Settings2,
    title: "Change appearance",
    description:
      "Choose light, dark, or system appearance from Settings. Your choice is saved in this browser.",
    href: "/settings",
    action: "Open settings",
  },
];

const faq = [
  {
    question: "Why does my public form say it is unavailable?",
    answer:
      "Only published forms can receive responses. Edit the form and change its status to Published. Draft and archived forms remain private.",
  },
  {
    question: "Will a localhost QR code work for customers?",
    answer:
      "No. A localhost address only works on the computer running the app. Deploy Formcraft first, then open the QR code from your deployed dashboard and share that code.",
  },
  {
    question: "Are responses anonymous?",
    answer:
      "Yes. Formcraft currently saves the answers and submission time, but it does not collect respondent identity.",
  },
  {
    question: "Can I edit a form after publishing it?",
    answer:
      "Yes. Use the edit button next to the form on your dashboard. Be aware that changing or removing questions does not change responses already submitted.",
  },
];

export default function HelpPage() {
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
              <CircleHelp size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold">Help center</p>
              <p className="text-xs text-zinc-500">Guides and common questions</p>
            </div>
          </div>
          <ModeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-8 px-5 py-9 sm:px-8 sm:py-12">
        <section>
          <p className="text-sm font-semibold text-orange-700">FORMCRAFT SUPPORT</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">How can we help?</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Find quick instructions for building forms, sharing them, and
            reviewing customer feedback.
          </p>
        </section>

        <section aria-label="Help topics" className="grid gap-4 sm:grid-cols-2">
          {helpTopics.map(({ icon: Icon, title, description, href, action }) => (
            <article
              key={title}
              className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                <Icon size={19} />
              </span>
              <h2 className="mt-4 font-semibold">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-zinc-500">
                {description}
              </p>
              <Link
                href={href}
                className="mt-4 inline-flex w-fit items-center rounded-lg text-sm font-semibold text-orange-700 hover:text-orange-800"
              >
                {action}
                <span className="sr-only">: {title}</span>
              </Link>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-zinc-100">
            {faq.map(({ question, answer }) => (
              <details key={question} className="group py-4 first:pt-0 last:pb-0">
                <summary className="cursor-pointer list-none pr-6 text-sm font-semibold marker:hidden after:float-right after:-mr-6 after:text-zinc-400 after:content-['+'] group-open:after:content-['−']">
                  {question}
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
