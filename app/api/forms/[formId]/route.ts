import { connectToDB } from "@/config/db";
import { FormField, type FieldType } from "@/models/form.fields";
import { Form, type FormStatus } from "@/models/forms";
import { User } from "@/models/user.model";
import { verifyRefreshToken } from "@/utils/token";
import mongoose, { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const fieldTypes: FieldType[] = [
  "text",
  "textarea",
  "number",
  "email",
  "select",
  "checkbox",
  "radio",
  "date",
];
const choiceFieldTypes: FieldType[] = ["select", "checkbox", "radio"];
const formStatuses: FormStatus[] = ["draft", "published", "archived"];

type RouteContext = { params: Promise<{ formId: string }> };

async function authenticate(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const payload = refreshToken ? verifyRefreshToken(refreshToken) : null;

  if (!refreshToken || !payload) {
    return { error: "Authentication required" as const };
  }

  await connectToDB();
  const user = await User.findOne()
    .where("_id", payload.id)
    .select("+refreshToken");

  if (!user || user.refreshToken !== refreshToken) {
    return { error: "Invalid or expired session" as const };
  }

  return { user };
}

function parseFields(value: unknown) {
  if (!Array.isArray(value)) return null;

  const parsed: {
    type: FieldType;
    label: string;
    placeholder: string;
    isRequired: boolean;
    options: string[];
    order: number;
  }[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const field = item as Record<string, unknown>;
    if (
      typeof field.type !== "string" ||
      !fieldTypes.includes(field.type as FieldType) ||
      typeof field.label !== "string" ||
      !field.label.trim() ||
      (field.placeholder !== undefined &&
        typeof field.placeholder !== "string") ||
      (field.isRequired !== undefined &&
        typeof field.isRequired !== "boolean") ||
      !Number.isInteger(field.order) ||
      (field.order as number) < 0 ||
      (field.options !== undefined &&
        (!Array.isArray(field.options) ||
          !field.options.every((option) => typeof option === "string")))
    ) {
      return null;
    }

    const type = field.type as FieldType;
    const options = (field.options as string[] | undefined) ?? [];
    if (choiceFieldTypes.includes(type) && options.length === 0) return null;

    parsed.push({
      type,
      label: field.label.trim(),
      placeholder:
        typeof field.placeholder === "string" ? field.placeholder.trim() : "",
      isRequired: field.isRequired === true,
      options: choiceFieldTypes.includes(type) ? options : [],
      order: field.order as number,
    });
  }

  return parsed;
}

async function getOwnedForm(request: NextRequest, formId: string) {
  const auth = await authenticate(request);
  if ("error" in auth) {
    return {
      response: NextResponse.json(
        { success: false, message: auth.error },
        { status: 401 },
      ),
    };
  }

  const form = await Form.findOne({ _id: formId, createdBy: auth.user._id });
  if (!form) {
    return {
      response: NextResponse.json(
        { success: false, message: "Form not found" },
        { status: 404 },
      ),
    };
  }
  return { user: auth.user, form };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { formId } = await params;
    if (!Types.ObjectId.isValid(formId)) {
      return NextResponse.json(
        { success: false, message: "Invalid form ID" },
        { status: 400 },
      );
    }

    const owned = await getOwnedForm(request, formId);
    if ("response" in owned) return owned.response;

    const fields = await FormField.find({ formId: owned.form._id })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      message: "Form retrieved",
      data: {
        id: owned.form._id.toString(),
        title: owned.form.title,
        description: owned.form.description ?? "",
        status: owned.form.status,
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
    console.error("Error retrieving form:", error);
    return NextResponse.json(
      { success: false, message: "Unable to retrieve form" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { formId } = await params;
    if (!Types.ObjectId.isValid(formId)) {
      return NextResponse.json(
        { success: false, message: "Invalid form ID" },
        { status: 400 },
      );
    }

    const owned = await getOwnedForm(request, formId);
    if ("response" in owned) return owned.response;

    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid form data" },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    if (
      typeof input.title !== "string" ||
      !input.title.trim() ||
      input.title.length > 120 ||
      (input.description !== undefined &&
        (typeof input.description !== "string" ||
          input.description.length > 500)) ||
      (input.status !== undefined &&
        (typeof input.status !== "string" ||
          !formStatuses.includes(input.status as FormStatus)))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid title, description, or status" },
        { status: 400 },
      );
    }

    owned.form.title = input.title.trim();
    owned.form.description =
      typeof input.description === "string" ? input.description.trim() : "";
    if (typeof input.status === "string") {
      owned.form.status = input.status as FormStatus;
    }
    await owned.form.save();

    return NextResponse.json({
      success: true,
      message: "Form updated",
      data: {
        id: owned.form._id.toString(),
        title: owned.form.title,
        description: owned.form.description,
        status: owned.form.status,
      },
    });
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update form" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { formId } = await params;
    if (!Types.ObjectId.isValid(formId)) {
      return NextResponse.json(
        { success: false, message: "Invalid form ID" },
        { status: 400 },
      );
    }

    const owned = await getOwnedForm(request, formId);
    if ("response" in owned) return owned.response;

    const body: unknown = await request.json();
    const fields = body && typeof body === "object"
      ? parseFields((body as Record<string, unknown>).fields)
      : null;
    if (!fields) {
      return NextResponse.json(
        { success: false, message: "Invalid form fields" },
        { status: 400 },
      );
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await FormField.deleteMany({ formId: owned.form._id }).session(session);
        await FormField.insertMany(
          fields.map((field) => ({ ...field, formId: owned.form._id })),
          { session },
        );
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({
      success: true,
      message: "Form fields updated",
      data: { formId: owned.form._id.toString(), fieldCount: fields.length },
    });
  } catch (error) {
    console.error("Error updating form fields:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update form fields" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { formId } = await params;
    if (!Types.ObjectId.isValid(formId)) {
      return NextResponse.json(
        { success: false, message: "Invalid form ID" },
        { status: 400 },
      );
    }

    const owned = await getOwnedForm(request, formId);
    if ("response" in owned) return owned.response;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await FormField.deleteMany({ formId: owned.form._id }).session(session);
        await Form.deleteOne({
          _id: owned.form._id,
          createdBy: owned.user._id,
        }).session(session);
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({
      success: true,
      message: "Form deleted",
      data: { id: owned.form._id.toString() },
    });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete form" },
      { status: 500 },
    );
  }
}
