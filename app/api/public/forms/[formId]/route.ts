import { connectToDB } from "@/config/db";
import { FormField, type FieldType } from "@/models/form.fields";
import { Form } from "@/models/forms";
import { FormResponse } from "@/models/form.response";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ formId: string }> };
type PublicField = {
  _id: Types.ObjectId;
  type: FieldType;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  options?: string[];
  order: number;
};

function isEmptyAnswer(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function validateAnswer(field: PublicField, value: unknown): string | null {
  if (isEmptyAnswer(value)) {
    return field.isRequired ? `${field.label} is required` : null;
  }

  if (field.type === "checkbox") {
    if (
      !Array.isArray(value) ||
      !value.every(
        (item) =>
          typeof item === "string" && (field.options ?? []).includes(item),
      )
    ) {
      return `Choose valid options for ${field.label}`;
    }
    return null;
  }

  if (field.type === "select" || field.type === "radio") {
    if (
      typeof value !== "string" ||
      !(field.options ?? []).includes(value)
    ) {
      return `Choose a valid option for ${field.label}`;
    }
    return null;
  }

  if (field.type === "number") {
    if (
      (typeof value !== "number" && typeof value !== "string") ||
      (typeof value === "string" && !value.trim()) ||
      !Number.isFinite(Number(value))
    ) {
      return `${field.label} must be a number`;
    }
    return null;
  }

  if (typeof value !== "string" || value.length > 10000) {
    return `${field.label} must be text up to 10,000 characters`;
  }

  if (
    field.type === "email" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ) {
    return `Enter a valid email for ${field.label}`;
  }

  if (field.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `Enter a valid date for ${field.label}`;
  }

  return null;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { formId } = await params;
    if (!Types.ObjectId.isValid(formId)) {
      return NextResponse.json(
        { success: false, message: "Invalid form link" },
        { status: 400 },
      );
    }

    await connectToDB();
    const form = await Form.findOne({
      _id: formId,
      status: "published",
    }).select("title description");

    if (!form) {
      return NextResponse.json(
        { success: false, message: "This form is unavailable" },
        { status: 404 },
      );
    }

    const fields = await FormField.find({ formId: form._id })
      .sort({ order: 1 })
      .select("type label placeholder isRequired options order")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        id: form._id.toString(),
        title: form.title,
        description: form.description ?? "",
        fields: fields.map((field) => ({
          id: field._id.toString(),
          type: field.type,
          label: field.label,
          placeholder: field.placeholder ?? "",
          isRequired: field.isRequired,
          options: field.options ?? [],
          order: field.order,
        })),
      },
    });
  } catch (error) {
    console.error("Unable to load public form:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load this form" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { formId } = await params;
    if (!Types.ObjectId.isValid(formId)) {
      return NextResponse.json(
        { success: false, message: "Invalid form link" },
        { status: 400 },
      );
    }

    const body: unknown = await request.json();
    if (
      !body ||
      typeof body !== "object" ||
      !("answers" in body) ||
      !body.answers ||
      typeof body.answers !== "object" ||
      Array.isArray(body.answers)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid response data" },
        { status: 400 },
      );
    }

    await connectToDB();
    const form = await Form.findOne({
      _id: formId,
      status: "published",
    }).select("title");
    if (!form) {
      return NextResponse.json(
        { success: false, message: "This form is unavailable" },
        { status: 404 },
      );
    }

    const fields = (await FormField.find({ formId: form._id })
      .sort({ order: 1 })
      .select("type label isRequired options order")
      .lean()) as PublicField[];

    if (!fields.length) {
      return NextResponse.json(
        { success: false, message: "This form has no questions yet" },
        { status: 400 },
      );
    }

    const inputAnswers = body.answers as Record<string, unknown>;
    const fieldIds = new Set(fields.map((field) => field._id.toString()));
    if (Object.keys(inputAnswers).some((fieldId) => !fieldIds.has(fieldId))) {
      return NextResponse.json(
        { success: false, message: "Response contains an unknown question" },
        { status: 400 },
      );
    }

    const answers = [];
    for (const field of fields) {
      const fieldId = field._id.toString();
      const value = inputAnswers[fieldId];
      const validationError = validateAnswer(field, value);
      if (validationError) {
        return NextResponse.json(
          { success: false, message: validationError },
          { status: 400 },
        );
      }
      if (!isEmptyAnswer(value)) {
        answers.push({
          fieldId: field._id,
          label: field.label,
          type: field.type,
          value:
            field.type === "number" && value !== undefined
              ? Number(value)
              : value,
        });
      }
    }

    await FormResponse.create({ formId: form._id, answers });
    return NextResponse.json(
      { success: true, message: "Your response has been submitted" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unable to submit form response:", error);
    return NextResponse.json(
      { success: false, message: "Unable to submit your response" },
      { status: 500 },
    );
  }
}
