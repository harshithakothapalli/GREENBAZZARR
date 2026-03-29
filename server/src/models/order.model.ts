import { Document, model, Schema } from "mongoose";

export interface IOrder extends Document {
  customerId: Schema.Types.ObjectId;
  farmerId: Schema.Types.ObjectId;
  cropId: Schema.Types.ObjectId;
  quantity: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  customerId: { type: Schema.Types.ObjectId, ref: "customer", required: true },
  farmerId: { type: Schema.Types.ObjectId, ref: "farmer", required: true },
  cropId: { type: Schema.Types.ObjectId, ref: "crop", required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    required: true,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const order = model<IOrder>("order",orderSchema);