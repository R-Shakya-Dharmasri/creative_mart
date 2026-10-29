
import mongoose, { Schema, type Document } from "mongoose";

export interface ITemplate extends Document {
  title: string;
  description: string;
  category: string;
  software: string;

  thumbnailUrl: string;
  previewImages: string[];
  previewVideos: string[];

  downloadUrl: string;
  fileSize: string;

  tags: string[];
  isFree: boolean;
  downloads: number;

  createdAt: Date;
  updatedAt: Date;
}

const templateSchema = new Schema<ITemplate>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    software: {
      type: String,
      default: "Other",
      trim: true,
    },

    thumbnailUrl: {
      type: String,
      required: true,
    },

    previewImages: {
      type: [String],
      default: [],
    },

    previewVideos: {
      type: [String],
      default: [],
    },

    downloadUrl: {
      type: String,
      required: true,
    },

    fileSize: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    isFree: {
      type: Boolean,
      default: true,
    },

    downloads: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Template = mongoose.model<ITemplate>(
  "Template",
  templateSchema
);

export default Template;


