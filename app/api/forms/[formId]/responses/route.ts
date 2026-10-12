import { connectToDB } from "@/config/db";
import { Form } from "@/models/forms";
import { FormResponse, IFormAnswer } from "@/models/form.response";
import { User } from "@/models/user.model";
import { verifyRefreshToken } from "@/utils/token";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ formId: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const payload = refreshToken ? verifyRefreshToken(refreshToken) : null;

  if (!refreshToken || !payload) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { formId } = await params;
    if (!Types.ObjectId.isValid(formId)) {
      return NextResponse.json(
        { success: false, message: "Invalid form ID" },
        { status: 400 },
      );
    }

    await connectToDB();
    const user = await User.findOne()
      .where("_id", payload.id)
      .select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session" },
        { status: 401 },
      );
    }

    const form = await Form.findOne({ _id: formId, createdBy: user._id })
      .select("title description status");
    if (!form) {
      return NextResponse.json(
        { success: false, message: "Form not found" },
        { status: 404 },
      );
    }

    const responses = await FormResponse.find({ formId: form._id })
      .sort({ submittedAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({
      success: true,
      message: "Responses retrieved",
      data: {
        form: {
          id: form._id.toString(),
          title: form.title,
          description: form.description ?? "",
          status: form.status,
        },
        responses: responses.map((response) => ({
          id: response._id.toString(),
          submittedAt: response.submittedAt,
          answers: response.answers.map((answer: IFormAnswer) => ({
            fieldId: answer.fieldId.toString(),
            label: answer.label,
            type: answer.type,
            value: answer.value,
          })),
        })),
      },
    });
  } catch (error) {
    console.error("Unable to retrieve form responses:", error);
    return NextResponse.json(
      { success: false, message: "Unable to retrieve responses" },
      { status: 500 },
    );
  }
}
