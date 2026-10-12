import mongoose, { Schema, Document, Types } from 'mongoose';

export type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'select' | 'checkbox' | 'radio' | 'date';

export interface IFormField extends Document {
  formId: Types.ObjectId; // Reference link to the parent Form
  type: FieldType;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  options?: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema<IFormField>({
  formId: {
    type: Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'textarea', 'number', 'email', 'select', 'checkbox', 'radio', 'date'],
    default: 'text'
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  options: {
    type: [String],
    default: []
  },
  order: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

// Indexing formId makes searching fields for a specific form much faster
FormFieldSchema.index({ formId: 1 });

export const FormField =
  mongoose.models.FormField ||
  mongoose.model<IFormField>("FormField", FormFieldSchema);
