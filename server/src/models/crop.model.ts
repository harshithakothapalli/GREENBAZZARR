import { Document, model, Schema } from "mongoose";

export interface ICrop extends Document {
  farmerId: Schema.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  quantityAvailable: number;
  unit: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cropSchema = new Schema<ICrop>({
  farmerId: { type: Schema.Types.ObjectId, ref: "farmer", required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantityAvailable: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, enum: ["kg", "ton", "piece"] },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const crop = model<ICrop>("crop",cropSchema);