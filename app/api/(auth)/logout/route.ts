import { connectToDB } from "@/config/db";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

function clearRefreshTokenCookie(response: NextResponse) {
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  try {
    if (refreshToken) {
      await connectToDB();
      await User.updateOne(
        { refreshToken },
        { $unset: { refreshToken: 1 } },
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
    clearRefreshTokenCookie(response);
    return response;
  } catch (error) {
    console.error("Error occurred while logging out:", error);
    const response = NextResponse.json(
      { success: false, message: "Unable to complete logout" },
      { status: 500 },
    );
    clearRefreshTokenCookie(response);
    return response;
  }
}