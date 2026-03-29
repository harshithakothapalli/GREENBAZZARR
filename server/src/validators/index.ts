import { param, body, query } from "express-validator";
import { RoleEnum as ROLES } from "../types";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(timezone); 
dayjs.tz.setDefault("Asia/Kolkata");

export const idValidater = [
  param("id").isMongoId().withMessage("Id must be a valid mongo id"),
];

export const roleValidater = [
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];

export const roleParamsValidater = [
  query("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];

export const roleWithQParamsValidater = [
  query("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),

  query("q").optional().isString().withMessage("Query must be a string"),
];

export const loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 10 })
    .withMessage("Password must be between 6 and 10 characters"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];

export const forgotPasswordValidator = [
  body("newPassword")
    .notEmpty()
    .withMessage("New Password is required")
    .isLength({ min: 6, max: 10 })
    .withMessage("New Password must be between 6 and 10 characters"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];

export const userRegisterValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 10 })
    .withMessage("Password must be between 6 and 10 characters"),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),

  body("mobile")
    .notEmpty()
    .withMessage("Mobile is required")
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be 10 digits"),

  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .isString()
    .withMessage("Address must be a string"),

  body("photo")
    .notEmpty()
    .withMessage("Photo is required")
    .isString()
    .withMessage("Photo must be a string URL"),
];

// Crop Validator (for POST /crops and PUT /crops/:id)
export const cropValidator = [
  body("name")
    .notEmpty()
    .withMessage("Crop name is required")
    .isString()
    .withMessage("Crop name must be a string"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("quantityAvailable")
    .notEmpty()
    .withMessage("Quantity available is required")
    .isInt({ min: 0 })
    .withMessage("Quantity available must be a non-negative integer"),
  body("unit")
    .notEmpty()
    .withMessage("Unit is required")
    .isIn(Object.values(["kg", "ton", "piece"]))
    .withMessage(`Unit must be one of: ${Object.values(["kg", "ton", "piece"]).join(", ")}`),
];

// Order Validator (for POST /orders)
export const orderValidator = [
  body("cropId")
    .notEmpty()
    .withMessage("Crop ID is required")
    .isMongoId()
    .withMessage("Crop ID must be a valid MongoDB ID"),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];

// Order Status Update Validator (for PUT /orders/:id/status)
export const orderStatusValidator = [
  param("id")
    .isMongoId()
    .withMessage("Order ID must be a valid MongoDB ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(Object.values(["pending", "confirmed", "shipped", "delivered", "cancelled"]))
    .withMessage(`Status must be one of: ${Object.values(["pending", "confirmed", "shipped", "delivered", "cancelled"]).join(", ")}`),
];

// Chat Message Validator (for POST /chat)
export const chatMessageValidator = [
  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isString()
    .withMessage("Message must be a string"),
];