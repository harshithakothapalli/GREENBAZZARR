import { NextFunction, Request, Response } from "express";
import CONFIG from "../config";
import jwt from "jsonwebtoken";
import { _401, Unauthorized } from "../customErrors";
import { RoleEnum, TokenInfo } from "../types";
import { Model } from "mongoose";
import { customer, farmer } from "../models";

// 🔥 IMPORTANT: Match this with your actual route (/api/user or /api/users)
const TO_IGNORE_URLS = [
  "/api/user/login",
  "/api/user/register",
];
/** * @description Middleware to check if the user is authenticated or not by verifying the JWT token from the cookie. * It also sets the user in the req object for further use and ensures the user is active. */
export const memberAuthHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ Skip authentication for login/register
    if (TO_IGNORE_URLS.includes(req.url)) {
      return next();
    }

    // 🔥 GET TOKEN (HEADER FIRST, THEN COOKIE)
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      token = req.cookies?.["token"];
    }

    if (!token) {
      return res.status(_401).json({
        message: "No token found",
      });
    }

    // 🔥 VERIFY TOKEN
    const user = jwt.verify(token, CONFIG.JWT_SECRET) as TokenInfo;

    if (!user) {
      return res.status(_401).json({
        message: "Invalid token",
      });
    }

    // 🔥 FIND MODEL BASED ON ROLE
    let modelToUse: typeof Model | null = null;

    switch (user.role) {
      case RoleEnum.FARMER:
        modelToUse = farmer;
        break;
      case RoleEnum.CUSTOMER:
        modelToUse = customer;
        break;
      default:
        throw new Unauthorized("Invalid role");
    }

    // 🔥 CHECK USER EXISTS IN DB
    const result = await modelToUse.findById(user._id);

    if (!result) {
      throw new Unauthorized("User not found");
    }

    // ✅ ATTACH USER TO REQUEST
    req.user = user;

    // ❌ REMOVE CookieSetter (not needed now)

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(_401)
        .json({ message: "Session expired, please login again" });
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(_401)
        .json({ message: "Invalid token detected" });
    } else {
      return res.status(_401).json({
        message: error.message || "Authentication failed",
      });
    }
  }
};