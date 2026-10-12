import { Schema, model, InferSchemaType, models } from "mongoose";

// 1. Define your schema structure
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      maxlength: 320,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      maxlength: 100,
      select: false, // Will correctly make this optional in your TS type!
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

// 2. Automatically extract the TypeScript type from the schema
export type IUser = InferSchemaType<typeof userSchema>;

// 3. Export the model (Next.js serverless-safe pattern)

const modelExists = models && "Form_Builder_User" in models;

// Export the model safely
export const User = modelExists
  ? models.Form_Builder_User
  : model("Form_Builder_User", userSchema);

// export const User = models.User || model("Form_Builder_User", userSchema);
