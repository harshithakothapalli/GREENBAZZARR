import { Router } from "express";
import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response } from "express";
import { chat as ChatMessageModel } from "../models";
import { GoogleGenerativeAI } from "@google/generative-ai"; // npm install @google/generative-ai
import { BadRequest } from "../customErrors";

// Note: In production, use process.env.GEMINI_API_KEY
const GEMINI_API_KEY = "AIzaSyAhCfTprXIjEZV2JW_8OC1jAxNsZ5xLijQ";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const router = Router();

// Post message to chatbot
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { message } = req.body;
    const { _id: userId, role } = req.user;
    const userType = role.charAt(0).toUpperCase() + role.slice(1); // "Farmer" or "Customer"

    if (!message) {
      throw new BadRequest("Message is required");
    }

    // Save user message
    await ChatMessageModel.create({
      userId,
      userType,
      message,
      sender: "user",
    });

    // Restrict to farming-related questions
    const systemPrompt = `
      You are a helpful chatbot for a farming app connecting farmers and customers.
      Only answer questions related to crops, farming practices, orders, crop management, or app features.
      If the question is unrelated, respond with: "I'm sorry, I can only answer questions related to farming, crops, orders, and app features."
      Keep responses concise and helpful.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(`${systemPrompt}\nUser: ${message}`);
    const botResponse = result.response.text();

    // Save bot response
    await ChatMessageModel.create({
      userId,
      userType,
      message: botResponse,
      sender: "bot",
    });

    res.json({ response: botResponse });
  })
);

// View chat history
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { _id: userId, role } = req.user;
    const userType = role.charAt(0).toUpperCase() + role.slice(1);

    const messages = await ChatMessageModel.find({ userId, userType }).sort({ timestamp: 1 });
    res.json({ messages });
  })
);

export default router;