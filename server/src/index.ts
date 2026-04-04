import express from "express";
import cors from "cors";
import compression from "compression";
import config from "./config";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { TokenInfo } from "./types";
import cookieParser from "cookie-parser";
import {
  FOLDER_PATH,
  blueText,
  greenText,
  redLogger,
  redText,
} from "./constants";
import { memberAuthHandler } from "./middlewares/AuthHandler";
import ErrorHandler from "./middlewares/ErrorHandler";
import mongoose from "mongoose";
import CONFIG from "./config";
import { paginationChecker } from "./middlewares/PaginationChecker";
import { hash } from "bcrypt";
import { Admin } from "./models/admin.model";

// 📁 Paths
const publicFolderPath = path.join(process.cwd(), FOLDER_PATH.PUBLIC);
const uploadFolderPath = path.join(publicFolderPath, FOLDER_PATH.UPLOADS);

console.log(blueText, "🚀 Application Starting...", blueText);

// ✅ Safe folder creation
if (!fs.existsSync(publicFolderPath)) {
  fs.mkdirSync(publicFolderPath, { recursive: true });
}

if (!fs.existsSync(uploadFolderPath)) {
  fs.mkdirSync(uploadFolderPath, { recursive: true });
}

// 🚀 Create express app
const app = express();

// 🔥 Middlewares
app.use(morgan("dev"));
app.use(cors({ origin: "*", credentials: true })); // ✅ FIXED
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use("/static", express.static(publicFolderPath));

// 🌍 Global types
declare global {
  namespace Express {
    interface Request {
      user: TokenInfo;
      prevObject: any;
    }
  }
}

// 🚀 Init DB + Server
(async () => {
  try {
    console.log(blueText, "📦 Database Initialization Started", blueText);

    // ✅ FIXED: use env variable
    await mongoose.connect(process.env.DB_URL as string, {
      maxPoolSize: CONFIG.DB_POOL_SIZE,
    });

    const admin = await Admin.findOne({ email: "admin@gmail.com" });

    if (!admin) {
      await Admin.create({
        name: "Admin",
        email: "admin@gmail.com",
        password: await hash("admin123", CONFIG.SALT_ROUNDS),
        mobile: "9632145874",
        address: "tpt",
      });
      console.log(greenText, "📦 Admin User Created", greenText);
    }

    console.log(greenText, "📦 Database Initialization Completed", greenText);

    // ✅ FIXED: dynamic PORT
    const PORT = process.env.PORT || config.PORT || 5000;

    app.listen(PORT, () => {
      console.log(
        greenText,
        `🎧 Server is listening on port: ${PORT} 🚀`,
        greenText
      );
    });

  } catch (error: any) {
    console.log(
      redText,
      "🚨 Error in server initialization\n",
      error.message,
      redText
    );
    redLogger("🛑 Application stopped");
    process.exit(1);
  }
})();

// ❤️ Health check
app.get("/", (_, res) => {
  res.json({
    status: "OK",
    health: "✅ Good",
    message: `Welcome to the API of ${config.APP_NAME}`,
  });
});

// 🔥 Middlewares
app.use(paginationChecker);


// 🔗 Routes (kept your style, no forced changes)
app.use("/api/users", require("./controllers/user").default);
app.use("/api/crops", require("./controllers/cropController").default);
app.use("/api/order", require("./controllers/orderController").default);
app.use("/api/chat", require("./controllers/chatController").default);

app.use(memberAuthHandler);

// ❌ 404
app.use("*", (_, res) => {
  res.status(404).json({
    status: "Not Found",
    health: "❌ Bad",
    msg: `Route Not Found`,
  });
});

// 🚨 Error handler
app.use(ErrorHandler);