import mongoose, { Schema, Document, Types } from 'mongoose';

export type FormStatus = 'draft' | 'published' | 'archived';

export interface IForm extends Document {
  title: string;
  description?: string;
  status: FormStatus;
  createdBy: Types.ObjectId; // Reference to your User model
  createdAt: Date;
  updatedAt: Date;
}

const FormSchema = new Schema<IForm>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

export const Form =
  mongoose.models.Form || mongoose.model<IForm>("Form", FormSchema);
