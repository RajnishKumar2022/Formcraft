import { connectToDB } from "@/config/db";
import { Form } from "@/models/forms";
import { FormResponse } from "@/models/form.response";
import { User } from "@/models/user.model";
import { verifyRefreshToken } from "@/utils/token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

  try {
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

    const forms = await Form.find({ createdBy: user._id })
      .sort({ updatedAt: -1 })
      .select("title description status createdAt updatedAt")
      .lean();
    const responseCounts = await FormResponse.aggregate<{
      _id: import("mongoose").Types.ObjectId;
      count: number;
    }>([
      { $match: { formId: { $in: forms.map((form) => form._id) } } },
      { $group: { _id: "$formId", count: { $sum: 1 } } },
    ]);
    const responseCountByForm = new Map(
      responseCounts.map(({ _id, count }) => [_id.toString(), count]),
    );

    return NextResponse.json({
      success: true,
      message: "Forms retrieved",
      data: forms.map((form) => ({
        id: form._id.toString(),
        title: form.title,
        description: form.description ?? "",
        status: form.status,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        responseCount: responseCountByForm.get(form._id.toString()) ?? 0,
      })),
    });
  } catch (error) {
    console.error("Error retrieving forms:", error);
    return NextResponse.json(
      { success: false, message: "Unable to retrieve forms" },
      { status: 500 },
    );
  }
}
