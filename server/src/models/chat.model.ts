import { Document, model, Schema } from "mongoose";

export interface IChatMessage extends Document {
  userId: Schema.Types.ObjectId;
  userType: string;
  message: string;
  sender: string;
  timestamp: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  userId: {
    type: Schema.Types.ObjectId,
    refPath: "userType",
    required: true,
  },
  userType: {
    type: String,
    required: true,
    enum: ["FARMER", "CUSTOMER"],
  },
  message: { type: String, required: true },
  sender: { type: String, required: true, enum: ["user", "bot"] },
  timestamp: { type: Date, default: Date.now },
});

export const chat = model<IChatMessage>("chat",chatMessageSchema);