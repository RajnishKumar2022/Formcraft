import { connectToDB } from "@/config/db";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/utils/hash";
import { getPasswordStrength } from "@/utils/password-strength";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({
        success: false,
        message: "Invalid signup data",
      }, { status: 400 });
    }

    const { fullName, email, password, confirmPassword } =
      body as Record<string, unknown>;
    if (
      typeof fullName !== "string" ||
      fullName.trim().length < 3 ||
      fullName.trim().length > 30 ||
      typeof email !== "string" ||
      email.trim().length > 320 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      password.length > 72 ||
      (typeof password === "string" &&
        getPasswordStrength(password) === "weak")
    ) {
      return NextResponse.json({
        success: false,
        message:
          "Enter a valid name and email, and use a password of at least medium strength (8–72 characters)",
      }, { status: 400 });
    }
    if (
      typeof confirmPassword !== "string" ||
      confirmPassword !== password
    ) {
      return NextResponse.json({
        success: false,
        message: "Passwords do not match",
      }, { status: 400 });
    }

    await connectToDB();
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne()
      .where("email", normalizedEmail)
      .lean();
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "Email already exists",
      }, { status: 409 });
    }

    const user = new User({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: await hashPassword(password),
    });

    try {
      await user.save();
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 11000
      ) {
        return NextResponse.json({
          success: false,
          message: "Email already exists",
        }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error occurred while registering user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to create account",
      },
      {
        status: 500,
      },
    );
  }
}
