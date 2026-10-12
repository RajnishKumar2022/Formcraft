import mongoose, { Schema, Types } from "mongoose";

export interface IFormAnswer {
  fieldId: Types.ObjectId;
  label: string;
  type: string;
  value: unknown;
}

export interface IFormResponse {
  formId: Types.ObjectId;
  answers: IFormAnswer[];
  submittedAt: Date;
}

const FormAnswerSchema = new Schema<IFormAnswer>(
  {
    fieldId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false },
);

const FormResponseSchema = new Schema<IFormResponse>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
      index: true,
    },
    answers: {
      type: [FormAnswerSchema],
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true },
);

FormResponseSchema.index({ formId: 1, submittedAt: -1 });

export const FormResponse =
  mongoose.models.FormResponse ||
  mongoose.model<IFormResponse>("FormResponse", FormResponseSchema);
