import { Schema } from "mongoose";

export type Role = "FARMER" | "CUSTOMER";

export type TokenInfo = {
  _id: Schema.Types.ObjectId;
  email: string;
  name: string;
  role: Role;
};

export enum RoleEnum {
  FARMER = "FARMER",
  CUSTOMER = "CUSTOMER",
}

export enum CropUnit {
  KG = "kg",
  TON = "ton",
  PIECE = "piece",
}

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}
