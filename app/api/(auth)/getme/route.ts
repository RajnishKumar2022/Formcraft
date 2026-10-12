import { connectToDB } from "@/config/db";
import { User } from "@/models/user.model";
import { verifyRefreshToken } from "@/utils/token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired session" },
      { status: 401 },
    );
  }

  try {
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

    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    return NextResponse.json({
      success: true,
      message: "Authenticated user",
      data: userData,
    });
  } catch (error) {
    console.error("Error retrieving authenticated user:", error);
    return NextResponse.json(
      { success: false, message: "Unable to retrieve authenticated user" },
      { status: 500 },
    );
  }
}