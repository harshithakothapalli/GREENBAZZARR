import { model, Schema } from "mongoose";
import { IBaseUser, IbaseUserSchema } from "./base.model";

export interface IFarmer extends IBaseUser {
  role: string;
  crops: Schema.Types.ObjectId[];
  orders: Schema.Types.ObjectId[];
  orderHistory: Schema.Types.ObjectId[];
}

const farmerSchema = new Schema<IFarmer>({
  ...IbaseUserSchema,
  role: { type: String, default: "farmer" },
  crops: [{ type: Schema.Types.ObjectId, ref: "Crop" }],
  orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  orderHistory: [{ type: Schema.Types.ObjectId, ref: "OrderHistory" }],
});

export const farmer = model<IFarmer>("farmer",farmerSchema);