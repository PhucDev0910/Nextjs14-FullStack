import { UploadResponse } from "imagekit/dist/libs/interfaces";
import { Model, model, models, Schema } from "mongoose";

export type Ad = {
  _id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  contact: string;
  files: UploadResponse[];
  location: {
    type: string;
    coordinates: number[];
  };
  userEmail: string;
  createdAt: Date;
  updatedAt: Date;
};

const adSchema = new Schema<Ad>(
  {
    title: String,
    price: Number,
    category: String,
    description: String,
    contact: String,
    files: [Object],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    userEmail: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

adSchema.index({ location: "2dsphere" }); //tạo chỉ mục không gian địa lý (Geospatial index)

export const AdModel = (models?.Ad as Model<Ad>) || model<Ad>("Ad", adSchema);
