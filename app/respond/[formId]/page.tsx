"use client";

import { useParams } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { Check, FileText, LoaderCircle, Send } from "lucide-react";

type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "select"
  | "checkbox"
  | "radio"
  | "date";

type PublicField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  isRequired: boolean;
  options: string[];
  order: number;
};

type PublicForm = {
  id: string;
  title: string;
  description: string;
  fields: PublicField[];
};

type FieldValue = string | string[];

export default function RespondPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <LoaderCircle className="animate-spin" size={24} />
        </main>
      }
    >
      <RespondForm />
    </Suspense>
  );
}

function RespondForm() {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<PublicForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, FieldValue>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadForm() {
      try {
        const response = await fetch(
          `/api/public/forms/${encodeURIComponent(formId)}`,
          { cache: "no-store", signal: controller.signal },
        );
        const result = (await response.json()) as {
          success: boolean;
          message: string;
          data?: PublicForm;
        };
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "This form is unavailable");
        }
        setForm(result.data);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this form",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadForm();
    return () => controller.abort();
  }, [formId]);

  function updateAnswer(fieldId: string, value: FieldValue) {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
  }

  function toggleCheckbox(fieldId: string, option: string, checked: boolean) {
    const current = Array.isArray(answers[fieldId]) ? answers[fieldId] as string[] : [];
    updateAnswer(
      fieldId,
      checked ? [...current, option] : current.filter((value) => value !== option),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(
        `/api/public/forms/${encodeURIComponent(form.id)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        },
      );
      const result = (await response.json()) as {
        success: boolean;
        message: string;
      };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit your response");
      }
      setIsSubmitted(true);
    } catch (submitError) {
      console.error("Response submission failed:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your response",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] px-4 py-10 text-zinc-900 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-center gap-2 text-sm font-bold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-orange-600 text-white">
            <FileText size={16} />
          </span>
          Formcraft
        </div>

        {isLoading ? (
          <div role="status" className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
            <LoaderCircle className="mx-auto animate-spin text-orange-600" size={24} />
            <p className="mt-3 text-sm text-zinc-500">Loading form…</p>
          </div>
        ) : error && !form ? (
          <div role="alert" className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
            <h1 className="text-xl font-bold">Form unavailable</h1>
            <p className="mt-2 text-sm text-zinc-500">{error}</p>
          </div>
        ) : isSubmitted ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check size={24} />
            </span>
            <h1 className="mt-4 text-2xl font-bold">Thank you!</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Your response has been submitted successfully.
            </p>
          </div>
        ) : form ? (
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
          >
            <div className="h-2 bg-orange-600" />
            <div className="space-y-7 p-6 sm:p-10">
              <header className="border-b border-zinc-100 pb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">
                  Feedback form
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight">
                  {form.title}
                </h1>
                {form.description && (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-500">
                    {form.description}
                  </p>
                )}
                <p className="mt-4 text-xs text-zinc-400">
                  Fields marked with * are required.
                </p>
              </header>

              {form.fields.map((field, index) => (
                <div key={field.id} className="space-y-2">
                  <label
                    htmlFor={`answer-${field.id}`}
                    className="block text-sm font-semibold"
                  >
                    <span className="mr-2 text-xs font-medium text-zinc-400">
                      {index + 1}.
                    </span>
                    {field.label}
                    {field.isRequired && (
                      <span className="ml-1 text-red-600" aria-label="required">
                        *
                      </span>
                    )}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      id={`answer-${field.id}`}
                      value={(answers[field.id] as string | undefined) ?? ""}
                      onChange={(event) => updateAnswer(field.id, event.target.value)}
                      placeholder={field.placeholder}
                      required={field.isRequired}
                      rows={4}
                      maxLength={10000}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={`answer-${field.id}`}
                      value={(answers[field.id] as string | undefined) ?? ""}
                      onChange={(event) => updateAnswer(field.id, event.target.value)}
                      required={field.isRequired}
                      className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                    >
                      <option value="">Select an option</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === "radio" || field.type === "checkbox" ? (
                    <div className="space-y-2">
                      {field.options.map((option, optionIndex) => (
                        <label
                          key={option}
                          className="flex items-center gap-2.5 rounded-lg border border-zinc-100 px-3 py-2.5 text-sm hover:bg-zinc-50"
                        >
                          <input
                            type={field.type === "radio" ? "radio" : "checkbox"}
                            name={`answer-${field.id}`}
                            value={option}
                            required={
                              field.type === "radio" &&
                              field.isRequired &&
                              optionIndex === 0
                            }
                            checked={
                              field.type === "radio"
                                ? answers[field.id] === option
                                : Array.isArray(answers[field.id]) &&
                                  (answers[field.id] as string[]).includes(option)
                            }
                            onChange={(event) =>
                              field.type === "radio"
                                ? updateAnswer(field.id, option)
                                : toggleCheckbox(field.id, option, event.target.checked)
                            }
                            className="size-4 accent-orange-600"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      id={`answer-${field.id}`}
                      type={
                        field.type === "number" ||
                        field.type === "email" ||
                        field.type === "date"
                          ? field.type
                          : "text"
                      }
                      value={(answers[field.id] as string | undefined) ?? ""}
                      onChange={(event) => updateAnswer(field.id, event.target.value)}
                      placeholder={field.placeholder}
                      required={field.isRequired}
                      maxLength={10000}
                      className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                    />
                  )}
                </div>
              ))}

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {isSubmitting ? "Submitting…" : "Submit response"}
              </button>
            </div>
          </form>
        ) : null}

        <p className="mt-6 text-center text-xs text-zinc-400">
          Powered by Formcraft
        </p>
      </div>
    </main>
  );
}
