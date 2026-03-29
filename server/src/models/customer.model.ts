import { model, Schema } from "mongoose";
import { IBaseUser, IbaseUserSchema } from "./base.model";

export interface ICustomer extends IBaseUser {
  role: string;
  orders: Schema.Types.ObjectId[];
  orderHistory: Schema.Types.ObjectId[];
}

const customerSchema = new Schema<ICustomer>({
  ...IbaseUserSchema,
  role: { type: String, default: "customer" },
  orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  orderHistory: [{ type: Schema.Types.ObjectId, ref: "OrderHistory" }],
});

export const customer = model<ICustomer>("customer",customerSchema);