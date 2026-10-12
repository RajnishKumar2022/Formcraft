import { connectToDB } from "@/config/db";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { comparePassword } from "@/utils/hash";
import { generateAccessToken, generateRefreshToken } from "@/utils/token";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "All done",
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Please fill all details" },
        { status: 400 },
      );
    }

    await connectToDB();

    // 1. FIX: Removed .lean() so we get a mutable Mongoose Document instance
    const existingUser = await User.findOne()
      .where("email", email)
      .select("+password");
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    // 2. Compare passwords
    const isPasswordMatch = await comparePassword(
      password,
      existingUser.password,
    );
    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    // 3. FIX: Convert _id to string cleanly
    const userId = existingUser._id.toString();
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken({ id: userId });

    // 4. FIX: Save the token directly back to the database using the document instance
    existingUser.refreshToken = refreshToken;
    await existingUser.save();

    // 5. Convert user document to clean object and strip out password for the response
    const userResponse = existingUser.toObject();
    delete userResponse.password;

    // 6. Build the response object
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: userResponse,
        accessToken, // Access token is returned safely in JSON body
      },
      { status: 200 }, // Changing to 200 since this is a Sign-In/Login action
    );

    // 7. Securely drop the refresh token into an httpOnly cookie
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error occurred while Logging In User:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
