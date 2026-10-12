"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Inbox,
  LoaderCircle,
  MessageSquareText,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/dark-light-mode";

type FormSummary = {
  id: string;
  title: string;
  status: "draft" | "published" | "archived";
  responseCount: number;
};

type Answer = {
  fieldId: string;
  label: string;
  type: string;
  value: unknown;
};

type FormResponse = {
  id: string;
  submittedAt: string;
  answers: Answer[];
};

function answerText(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export default function ResponsesPage() {
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [selectedFormTitle, setSelectedFormTitle] = useState("");
  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadForms() {
      try {
        const response = await fetch("/api/forms", {
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as {
          success: boolean;
          message: string;
          data?: FormSummary[];
        };
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Unable to load your forms");
        }

        setForms(result.data);
        const requestedFormId = new URLSearchParams(window.location.search).get("formId");
        const selected = result.data.find((form) => form.id === requestedFormId)
          ?? result.data[0];
        if (selected) setSelectedFormId(selected.id);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error("Unable to load forms for responses:", loadError);
        setError(
          loadError instanceof Error ? loadError.message : "Unable to load forms",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoadingForms(false);
      }
    }

    void loadForms();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedFormId) return;

    const controller = new AbortController();

    async function loadResponses() {
      setIsLoadingResponses(true);
      setError("");
      try {
        const response = await fetch(
          `/api/forms/${encodeURIComponent(selectedFormId)}/responses`,
          {
            credentials: "same-origin",
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const result = (await response.json()) as {
          success: boolean;
          message: string;
          data?: {
            form: { id: string; title: string };
            responses: FormResponse[];
          };
        };
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Unable to load responses");
        }

        setSelectedFormTitle(result.data.form.title);
        setResponses(result.data.responses);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error("Unable to load form responses:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load responses",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoadingResponses(false);
      }
    }

    void loadResponses();
    return () => controller.abort();
  }, [selectedFormId]);

  const selectedForm = forms.find((form) => form.id === selectedFormId);

  return (
    <main className="min-h-screen bg-[#faf9f7] text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              aria-label="Back to dashboard"
              className="flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <ArrowLeft size={18} />
            </Link>
            <span className="flex size-8 items-center justify-center rounded-lg bg-orange-600 text-white">
              <MessageSquareText size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold">Form responses</p>
              <p className="text-xs text-zinc-500">Review submitted answers</p>
            </div>
          </div>
          <ModeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:px-8 sm:py-10">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-orange-700">WORKSPACE</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Responses</h1>
            <p className="mt-2 text-sm text-zinc-500">
              View feedback submitted to your forms.
            </p>
          </div>
          {forms.length > 0 && (
            <div className="w-full sm:w-72">
              <label htmlFor="form-select" className="mb-1.5 block text-xs font-semibold text-zinc-600">
                Select a form
              </label>
              <select
                id="form-select"
                value={selectedFormId}
                onChange={(event) => setSelectedFormId(event.target.value)}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-orange-500"
              >
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.title} ({form.responseCount})
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        {error ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : isLoadingForms ? (
          <Loading />
        ) : forms.length === 0 ? (
          <EmptyState
            title="No forms yet"
            description="Create a form first, then its submitted responses will appear here."
          />
        ) : isLoadingResponses ? (
          <Loading />
        ) : responses.length === 0 ? (
          <EmptyState
            title={`No responses for ${selectedFormTitle || selectedForm?.title || "this form"} yet`}
            description={
              selectedForm?.status === "published"
                ? "Share the form link with customers to start collecting feedback."
                : "Publish this form before customers can submit responses."
            }
          >
            {selectedForm?.status === "published" && (
              <Link
                href={`/respond/${encodeURIComponent(selectedForm.id)}`}
                target="_blank"
                className="mt-4 inline-flex h-9 items-center rounded-lg bg-orange-600 px-3 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Open public form
              </Link>
            )}
          </EmptyState>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4">
              <div>
                <h2 className="font-semibold">{selectedFormTitle}</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {responses.length} {responses.length === 1 ? "response" : "responses"}
                  {responses.length === 200 ? " (latest 200 shown)" : ""}
                </p>
              </div>
              <span className="flex size-9 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                <Inbox size={18} />
              </span>
            </div>

            {responses.map((response, index) => (
              <article
                key={response.id}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
              >
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-5 py-4">
                  <h3 className="text-sm font-semibold">Response {responses.length - index}</h3>
                  <time
                    dateTime={response.submittedAt}
                    className="text-xs text-zinc-500"
                  >
                    {new Date(response.submittedAt).toLocaleString()}
                  </time>
                </header>
                <dl className="divide-y divide-zinc-100 px-5">
                  {response.answers.map((answer) => (
                    <div
                      key={answer.fieldId}
                      className="grid gap-1 py-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:gap-6"
                    >
                      <dt className="text-xs font-semibold text-zinc-500">
                        {answer.label}
                      </dt>
                      <dd className="whitespace-pre-wrap break-words text-sm">
                        {answerText(answer.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function Loading() {
  return (
    <div role="status" className="rounded-xl border border-zinc-200 bg-white px-5 py-10 text-center">
      <LoaderCircle size={22} className="mx-auto animate-spin text-orange-600" />
      <p className="mt-3 text-sm text-zinc-500">Loading responses…</p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-6 py-12 text-center">
      <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
        <FileText size={20} />
      </span>
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {description}
      </p>
      {children}
    </div>
  );
}
