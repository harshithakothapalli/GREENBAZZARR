import { Document } from "mongoose";

export interface IBaseUser extends Document {
   name: string;
  email: string;
  password: string;
  mobile?: string;
  address?: string;
  photo?: string;
  fileType?: string;
}

export const IbaseUserSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: false },
  address: { type: String, required: false },
  photo: { type: String, required: false },
  fileType: { type: String, required: false },
};
