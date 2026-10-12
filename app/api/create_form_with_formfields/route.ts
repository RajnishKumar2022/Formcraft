import { connectToDB } from "@/config/db";
import { FormField, type FieldType } from "@/models/form.fields";
import { Form, type FormStatus } from "@/models/forms";
import { User } from "@/models/user.model";
import { verifyRefreshToken } from "@/utils/token";
import { Types } from "mongoose";
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

type FieldInput = {
  type: FieldType;
  label: string;
  placeholder: string;
  isRequired: boolean;
  options: string[];
  order: number;
};

function parseFields(value: unknown): FieldInput[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const parsed: FieldInput[] = [];
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
      (field.order !== undefined &&
        (!Number.isInteger(field.order) || (field.order as number) < 0)) ||
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
      order:
        typeof field.order === "number" ? field.order : parsed.length,
    });
  }

  return parsed;
}

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const tokenPayload = refreshToken
      ? verifyRefreshToken(refreshToken)
      : null;

    if (!refreshToken || !tokenPayload) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid form data" },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const fields = parseFields(input.fields);
    if (!fields) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Add at least one valid field. Choice fields need at least one option.",
        },
        { status: 400 },
      );
    }

    const formId =
      typeof input.formId === "string" && Types.ObjectId.isValid(input.formId)
        ? input.formId
        : null;
    if (input.formId !== undefined && !formId) {
      return NextResponse.json(
        { success: false, message: "Invalid form ID" },
        { status: 400 },
      );
    }

    const createInlineForm = formId === null;
    const { title, description, status } = input;
    if (
      createInlineForm &&
      (typeof title !== "string" || !title.trim())
    ) {
      return NextResponse.json(
        { success: false, message: "A form title is required" },
        { status: 400 },
      );
    }
    if (
      createInlineForm &&
      status !== undefined &&
      !formStatuses.includes(status as FormStatus)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid form status" },
        { status: 400 },
      );
    }
    if (
      createInlineForm &&
      description !== undefined &&
      typeof description !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Description must be text" },
        { status: 400 },
      );
    }

    await connectToDB();
    const user = await User.findOne()
      .where("_id", tokenPayload.id)
      .select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session" },
        { status: 401 },
      );
    }

    let form;
    let createdHere = false;

    if (formId) {
      form = await Form.findOne({ _id: formId, createdBy: user._id });
      if (!form) {
        return NextResponse.json(
          { success: false, message: "Form not found" },
          { status: 404 },
        );
      }
    } else {
      const formStatus: FormStatus =
        status === undefined ? "draft" : (status as FormStatus);
      form = new Form({
        title: (title as string).trim(),
        description:
          typeof description === "string" ? description.trim() : "",
        status: formStatus,
        createdBy: user._id,
      });
      await form.save();
      createdHere = true;
    }

    try {
      const createdFields = await FormField.insertMany(
        fields.map((field) => ({ ...field, formId: form._id })),
      );
      return NextResponse.json(
        {
          success: true,
          message: "Form fields added",
          data: {
            formId: form._id.toString(),
            title: form.title,
            fields: createdFields.map((field) => ({
              id: field._id.toString(),
              type: field.type,
              label: field.label,
              placeholder: field.placeholder,
              isRequired: field.isRequired,
              options: field.options,
              order: field.order,
            })),
          },
        },
        { status: createdHere ? 201 : 200 },
      );
    } catch (error) {
      if (createdHere) {
        await Form.deleteOne({ _id: form._id, createdBy: user._id });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating form with fields:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create form fields" },
      { status: 500 },
    );
  }
}
