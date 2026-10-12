"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CircleHelp,
  FilePlus2,
  FileText,
  GripVertical,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/dark-light-mode";
import type { FieldType } from "@/models/form.fields";
import type { FormStatus } from "@/models/forms";

type CreationMode = "build-now" | "build-later";

type FormFieldDraft = {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  isRequired: boolean;
  options: string;
  order: number;
};

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: "text", label: "Short answer" },
  { value: "textarea", label: "Long answer" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "radio", label: "Multiple choice" },
  { value: "date", label: "Date" },
];

function createEmptyField(order: number): FormFieldDraft {
  return {
    id: crypto.randomUUID(),
    type: "text",
    label: "",
    placeholder: "",
    isRequired: false,
    options: "",
    order,
  };
}

export default function FormPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<FormStatus>("draft");
  const [mode, setMode] = useState<CreationMode>("build-now");
  const [formCreated, setFormCreated] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isAddingFields, setIsAddingFields] = useState(false);
  const [isDeletingForm, setIsDeletingForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");
  const [fields, setFields] = useState<FormFieldDraft[]>([]);

  useEffect(() => {
    const editId = new URLSearchParams(window.location.search).get("edit");
    if (editId === null) return;
    const selectedFormId: string = editId;

    const controller = new AbortController();

    async function loadForm() {
      setFormId(selectedFormId);
      setIsEditing(true);
      setIsLoadingForm(true);
      setRequestError("");
      try {
        const response = await fetch(`/api/forms/${encodeURIComponent(selectedFormId)}`, {
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as {
          success: boolean;
          message: string;
          data?: {
            id: string;
            title: string;
            description: string;
            status: FormStatus;
            fields: {
              id: string;
              type: FieldType;
              label: string;
              placeholder: string;
              isRequired: boolean;
              options: string[];
              order: number;
            }[];
          };
        };

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Unable to load this form");
        }

        setTitle(result.data.title);
        setDescription(result.data.description);
        setStatus(result.data.status);
        setFormId(result.data.id);
        setFormCreated(true);
        setMode("build-now");
        setFields(
          result.data.fields.map((field) => ({
            ...field,
            options: field.options.join(", "),
          })),
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Unable to load form for editing:", error);
        setRequestError(
          error instanceof Error ? error.message : "Unable to load this form",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoadingForm(false);
      }
    }

    void loadForm();
    return () => controller.abort();
  }, []);

  async function handleForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestMessage("");
    setRequestError("");
    setIsCreatingForm(true);

    try {
      const response = await fetch(
        isEditing && formId
          ? `/api/forms/${encodeURIComponent(formId)}`
          : "/api/create_form",
        {
        method: isEditing && formId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          status,
        }),
      });
      const result = (await response.json()) as {
        success: boolean;
        message: string;
        data?: { id: string };
      };

      if (!response.ok || !result.success || (!isEditing && !result.data?.id)) {
        throw new Error(result.message || "Unable to create form");
      }

      if (result.data?.id) setFormId(result.data.id);
      setFormCreated(true);
      setRequestMessage(isEditing
        ? "Form details updated."
        : mode === "build-later"
          ? "Draft created. You can add questions below whenever you’re ready."
          : "Form created. Add your questions below.");
    } catch (error) {
      console.error("Form creation failed:", error);
      setRequestError(
        error instanceof Error ? error.message : "Unable to create form",
      );
    } finally {
      setIsCreatingForm(false);
    }
  }

  function addField() {
    setFields((currentFields) => [
      ...currentFields,
      createEmptyField(currentFields.length),
    ]);
  }

  function updateField(
    fieldId: string,
    updates: Partial<Omit<FormFieldDraft, "id" | "order">>,
  ) {
    setFields((currentFields) =>
      currentFields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field,
      ),
    );
  }

  function removeField(fieldId: string) {
    setFields((currentFields) =>
      currentFields
        .filter((field) => field.id !== fieldId)
        .map((field, index) => ({ ...field, order: index })),
    );
  }

  async function addFormFields(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestMessage("");
    setRequestError("");

    if (!title.trim()) {
      setRequestError("Enter a form title before adding fields.");
      return;
    }

    const formFields = fields.map(({ options, ...field }) => ({
      ...field,
      options: ["select", "checkbox", "radio"].includes(field.type)
        ? options
            .split(",")
            .map((option) => option.trim())
            .filter(Boolean)
        : [],
    }));

    setIsAddingFields(true);
    try {
      const response = await fetch(
        isEditing && formId
          ? `/api/forms/${encodeURIComponent(formId)}`
          : "/api/create_form_with_formfields",
        {
        method: isEditing && formId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          ...(isEditing && formId
            ? {}
            : formId
              ? { formId }
              : { title: title.trim(), description: description.trim(), status }),
          fields: formFields,
        }),
      });
      const result = (await response.json()) as {
        success: boolean;
        message: string;
        data?: { formId: string };
      };

      if (!response.ok || !result.success || !result.data?.formId) {
        throw new Error(result.message || "Unable to add form fields");
      }

      setFormId(result.data.formId);
      setFormCreated(true);
      if (!isEditing) setFields([]);
      setRequestMessage(isEditing ? "Your form fields have been updated." : "Your form fields have been saved.");
    } catch (error) {
      console.error("Adding form fields failed:", error);
      setRequestError(
        error instanceof Error ? error.message : "Unable to add form fields",
      );
    } finally {
      setIsAddingFields(false);
    }
  }

  async function deleteCurrentForm() {
    if (!formId || !isEditing) return;
    if (
      !window.confirm(
        `Delete "${title}" and all of its fields? This cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeletingForm(true);
    setRequestError("");
    try {
      const response = await fetch(
        `/api/forms/${encodeURIComponent(formId)}`,
        { method: "DELETE", credentials: "same-origin" },
      );
      const result = (await response.json()) as {
        success: boolean;
        message: string;
      };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete form");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Form deletion failed:", error);
      setRequestError(
        error instanceof Error ? error.message : "Unable to delete form",
      );
      setIsDeletingForm(false);
    }
  }

  const canEditFields = mode === "build-now" || formCreated;

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
              <FileText size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold">
                {isEditing ? "Edit form" : "Create a form"}
              </p>
              <p className="text-xs text-zinc-500">
                {isLoadingForm ? "Loading form…" : isEditing ? "Editing saved form" : "New form · Draft"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <span className="hidden items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 sm:inline-flex">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Changes saved locally
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 lg:py-12">
        <div className="min-w-0 space-y-8">
          <section>
            <p className="text-sm font-semibold text-orange-700">FORM SETUP</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {isEditing ? "Update your form" : "Start with the basics"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
              Give your form a clear name and decide whether you want to build
              its questions now or come back to them later.
            </p>
          </section>

          <form
            id="create-form"
            onSubmit={handleForm}
            className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <div>
              <label htmlFor="form-title" className="text-sm font-semibold">
                Form title <span className="text-orange-600">*</span>
              </label>
              <Input
                id="form-title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Customer feedback"
                required
                maxLength={120}
                className="mt-2 h-11 rounded-lg border border-zinc-200 bg-white px-3 focus-visible:border-orange-500"
              />
              <p className="mt-1.5 text-xs text-zinc-400">
                Use a name that makes this form easy to find in your workspace.
              </p>
            </div>

            <div>
              <label htmlFor="form-description" className="text-sm font-semibold">
                Description <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <textarea
                id="form-description"
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Tell people what this form is for."
                maxLength={500}
                rows={3}
                className="mt-2 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
              />
              <p className="mt-1.5 text-xs text-zinc-400">
                A short explanation helps people know what to expect.
              </p>
            </div>

            <div>
              <label htmlFor="form-status" className="text-sm font-semibold">
                Initial status
              </label>
              <div className="relative mt-2">
                <select
                  id="form-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as FormStatus)}
                  className="h-11 w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-10 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                >
                  <option value="draft">Draft — keep it private while building</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
              </div>
              <p className="mt-1.5 text-xs text-zinc-400">
                New forms normally start as drafts. You can change the status later.
              </p>
            </div>

            <div className="border-t border-zinc-100 pt-5">
              <h2 className="text-sm font-semibold">When would you like to add fields?</h2>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                You can start adding questions now, or create an empty draft and
                edit it later.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ModeCard
                  selected={mode === "build-now"}
                  title="Build as I go"
                  detail="Create the form and add its questions in this step."
                  icon={Sparkles}
                  onClick={() => setMode("build-now")}
                />
                <ModeCard
                  selected={mode === "build-later"}
                  title="Add fields later"
                  detail="Create the form first, then open it to add questions."
                  icon={FilePlus2}
                  onClick={() => setMode("build-later")}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-5">
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </Link>
                {isEditing && (
                  <button
                    type="button"
                    onClick={deleteCurrentForm}
                    disabled={isDeletingForm}
                    className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    {isDeletingForm ? "Deleting..." : "Delete form"}
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isCreatingForm || (formCreated && !isEditing) || isLoadingForm}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
              >
                {isLoadingForm ? (
                  "Loading..."
                ) : isCreatingForm ? (
                  "Creating..."
                ) : formCreated ? (
                  <>
                    <Check size={16} />
                    {isEditing ? "Save form details" : "Form created"}
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create form
                  </>
                )}
              </button>
            </div>
          </form>

          {(requestMessage || requestError) && (
            <p
              role={requestError ? "alert" : "status"}
              className={`rounded-lg border px-4 py-3 text-sm ${
                requestError
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {requestError || requestMessage}
              {formId && !requestError && (
                <span className="mt-1 block text-xs opacity-80">
                  Form ID: {formId}
                </span>
              )}
            </p>
          )}

          {canEditFields && (
            <form
              onSubmit={addFormFields}
              className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-orange-700">FORM FIELDS</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight">
                    Add your questions
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    Define each field’s type, label, placeholder, and required setting.
                  </p>
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                  {fields.length} {fields.length === 1 ? "field" : "fields"}
                </span>
              </div>

              {fields.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 px-5 py-8 text-center">
                  <span className="mx-auto flex size-10 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm">
                    <Plus size={19} />
                  </span>
                  <p className="mt-3 text-sm font-semibold">No fields added yet</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Add your first question to begin building the form.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <FieldEditor
                      key={field.id}
                      field={field}
                      index={index}
                      onChange={(updates) => updateField(field.id, updates)}
                      onRemove={() => removeField(field.id)}
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap justify-between gap-3 border-t border-zinc-100 pt-5">
                <button
                  type="button"
                  onClick={addField}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  <Plus size={16} />
                  Add a question
                </button>
                <button
                  type="submit"
                  disabled={fields.length === 0 || isAddingFields}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check size={16} />
                  {isAddingFields
                    ? "Saving fields..."
                    : isEditing
                      ? "Update form fields"
                      : "Add form fields"}
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-4 lg:pt-[76px]">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
              <CircleHelp size={18} />
            </span>
            <h2 className="mt-4 text-sm font-semibold">How this works</h2>
            <ol className="mt-4 space-y-4">
              <GuideStep
                number="1"
                title="Create the form"
                detail="Add a title and optional description. Your form starts as a draft."
                complete={formCreated}
              />
              <GuideStep
                number="2"
                title="Add fields"
                detail="Choose question types and configure labels, options, and required fields."
                complete={fields.length > 0}
              />
              <GuideStep
                number="3"
                title="Publish when ready"
                detail="Review your questions before sharing the form with respondents."
                complete={false}
              />
            </ol>
          </section>

          <section className="rounded-2xl border border-orange-100 bg-orange-50/70 p-5">
            <h2 className="text-sm font-semibold text-orange-950">Form fields in your schema</h2>
            <p className="mt-2 text-xs leading-5 text-orange-950/70">
              Supported types include text, long text, number, email, dropdown,
              checkboxes, multiple choice, and date.
            </p>
            <p className="mt-3 text-xs leading-5 text-orange-950/70">
              Dropdown, checkbox, and multiple-choice options are entered as a
              comma-separated list.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}

function ModeCard({
  selected,
  title,
  detail,
  icon: Icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  detail: string;
  icon: typeof Sparkles;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
        selected
          ? "border-orange-400 bg-orange-50/70 ring-2 ring-orange-100"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      <span
        className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${
          selected ? "bg-white text-orange-700" : "bg-zinc-100 text-zinc-600"
        }`}
      >
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2 text-sm font-semibold">
          {title}
          {selected && <Check size={15} className="shrink-0 text-orange-700" />}
        </span>
        <span className="mt-1 block text-xs leading-5 text-zinc-500">{detail}</span>
      </span>
    </button>
  );
}

function FieldEditor({
  field,
  index,
  onChange,
  onRemove,
}: {
  field: FormFieldDraft;
  index: number;
  onChange: (updates: Partial<Omit<FormFieldDraft, "id" | "order">>) => void;
  onRemove: () => void;
}) {
  const acceptsOptions = ["select", "checkbox", "radio"].includes(field.type);

  return (
    <article className="rounded-xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <GripVertical size={15} className="text-zinc-300" />
          Question {index + 1}
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove question ${index + 1}`}
          className="flex size-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`field-type-${field.id}`} className="text-xs font-semibold text-zinc-600">
            Field type
          </label>
          <div className="relative mt-1.5">
            <select
              id={`field-type-${field.id}`}
              value={field.type}
              onChange={(event) => onChange({ type: event.target.value as FieldType })}
              className="h-10 w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-9 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
            >
              {fieldTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`field-label-${field.id}`} className="text-xs font-semibold text-zinc-600">
            Question label
          </label>
          <Input
            id={`field-label-${field.id}`}
            value={field.label}
            onChange={(event) => onChange({ label: event.target.value })}
            placeholder="e.g. What is your name?"
            required
            className="mt-1.5 h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus-visible:border-orange-500"
          />
        </div>

        <div className={acceptsOptions ? "" : "sm:col-span-2"}>
          <label htmlFor={`field-placeholder-${field.id}`} className="text-xs font-semibold text-zinc-600">
            Placeholder <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <Input
            id={`field-placeholder-${field.id}`}
            value={field.placeholder}
            onChange={(event) => onChange({ placeholder: event.target.value })}
            placeholder="Hint shown inside the answer field"
            className="mt-1.5 h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus-visible:border-orange-500"
          />
        </div>

        {acceptsOptions && (
          <div>
            <label htmlFor={`field-options-${field.id}`} className="text-xs font-semibold text-zinc-600">
              Options
            </label>
            <Input
              id={`field-options-${field.id}`}
              value={field.options}
              onChange={(event) => onChange({ options: event.target.value })}
              placeholder="Option 1, Option 2, Option 3"
              required
              className="mt-1.5 h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus-visible:border-orange-500"
            />
          </div>
        )}

        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 sm:col-span-2">
          <input
            type="checkbox"
            checked={field.isRequired}
            onChange={(event) => onChange({ isRequired: event.target.checked })}
            className="size-4 accent-orange-600"
          />
          Make this field required
        </label>
      </div>
    </article>
  );
}

function GuideStep({
  number,
  title,
  detail,
  complete,
}: {
  number: string;
  title: string;
  detail: string;
  complete: boolean;
}) {
  return (
    <li className="flex gap-3">
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          complete
            ? "bg-emerald-100 text-emerald-700"
            : "bg-zinc-100 text-zinc-500"
        }`}
      >
        {complete ? <Check size={14} /> : number}
      </span>
      <span>
        <span className="block text-xs font-semibold">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-zinc-500">{detail}</span>
      </span>
    </li>
  );
}
