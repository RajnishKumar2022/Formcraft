import { connectToDB } from "@/config/db";
import { Form, type FormStatus } from "@/models/forms";
import { User } from "@/models/user.model";
import { verifyRefreshToken } from "@/utils/token";
import { NextRequest, NextResponse } from "next/server";

const formStatuses: FormStatus[] = ["draft", "published", "archived"];

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

    const { title, description, status } = body as Record<string, unknown>;
    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "A form title is required" },
        { status: 400 },
      );
    }
    if (description !== undefined && typeof description !== "string") {
      return NextResponse.json(
        { success: false, message: "Description must be text" },
        { status: 400 },
      );
    }
    if (status !== undefined && !formStatuses.includes(status as FormStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid form status" },
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

    const formStatus: FormStatus =
      status === undefined ? "draft" : (status as FormStatus);
    const form = new Form({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      status: formStatus,
      createdBy: user._id,
    });
    await form.save();

    return NextResponse.json(
      {
        success: true,
        message: "Form created",
        data: {
          id: form._id.toString(),
          title: form.title,
          description: form.description,
          status: form.status,
          createdAt: form.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create form" },
      { status: 500 },
    );
  }
}
