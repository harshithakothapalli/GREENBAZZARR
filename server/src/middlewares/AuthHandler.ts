import { NextFunction, Request, Response } from "express";
import CONFIG from "../config";
import jwt from "jsonwebtoken";
import { CookieSetter } from "./CookieSetter";
import { _401, Unauthorized } from "../customErrors";
import { RoleEnum, TokenInfo } from "../types";
import { Model } from "mongoose";
import { customer, farmer } from "../models";


// URLs to ignore authentication
const TO_IGNORE_URLS = [
  "/api/users/login",
  "/api/users/register",
];

/**
 * @description Middleware to check if the user is authenticated or not by verifying the JWT token from the cookie.
 * It also sets the user in the `req` object for further use and ensures the user is active.
 */
export const memberAuthHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip authentication for specific URLs
  if (TO_IGNORE_URLS.includes(req.url)) {
    return next();
  }

  // Extract token from cookies
  const token = req.cookies["token"];

  if (!token) {
    return res.status(_401).json({
      message: "No token found",
    });
  }

  try {
    // Verify the token
    const user = jwt.verify(token, CONFIG.JWT_SECRET) as TokenInfo;

    if (!user) {
      return res.status(_401).json({
        message: "Invalid token",
      });
    }

    // Determine the model to use based on the user's role
    let modelToUse: typeof Model | null = null;

    switch (user.role) {
      case RoleEnum.FARMER:
        modelToUse = farmer;
        break;
      case RoleEnum.CUSTOMER:
        modelToUse = customer;
        break;
      default:
        modelToUse = null;
        break;
    }

    if (!modelToUse) {
      throw new Unauthorized("Invalid role");
    }

    // Find the user in the database
    const result = await modelToUse.findById(user._id);

    if (!result) {
      throw new Unauthorized("User not found");
    }

    // Attach the user to the request object
    req.user = user;

    // Set the token in the cookie (optional, for refreshing the token)
    await CookieSetter(req, res, () => {});

    // Proceed to the next middleware or route handler
    next();
  } catch (error: any) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(_401).json({ message: "Please login again, session expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(_401).json({ message: "Token manipulation detected" });
    } else {
      return res.status(_401).json({ message: error.message || "Authentication failed" });
    }
  }
};