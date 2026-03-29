import { Document, model, Schema } from "mongoose";

export interface IOrderHistory extends Document {
  orderId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  userType: string;
  status: string;
  paymentStatus: string;
  createdAt: Date;
}

const orderHistorySchema = new Schema<IOrderHistory>({
  orderId: { type: Schema.Types.ObjectId, ref: "order", required: true },
  userId: {
    type: Schema.Types.ObjectId,
    refPath: "userType",
    required: true,
  },
  userType: {
    type: String,
    required: true,
    enum: ["Farmer", "Customer"],
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ["pending", "completed", "failed"],
  },
  createdAt: { type: Date, default: Date.now },
});

export const orderHistory = model<IOrderHistory>("orderHistory",orderHistorySchema);