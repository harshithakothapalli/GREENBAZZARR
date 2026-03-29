import { Router } from "express";
import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response } from "express";
import { crop as CropModel } from "../models"; // Assuming models are exported as { crop, order, etc. }
import { validate } from "../middlewares/Validator";
import { cropValidator, idValidater } from "../validators"; // Assume you have validators for crop
import { BadRequest } from "../customErrors";
import { uploadLocal } from "../constants/lib"; // For image upload
import config from "../config";

const router = Router();

// Add Crop (Farmer only)
router.post(
  "/",
  uploadLocal.single("image"),
  validate(cropValidator), // Assume validator for crop fields
  asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.user;
    if (role !== "FARMER") {
      throw new BadRequest("Only farmers can add crops");
    }

    const { name, description, price, quantityAvailable, unit } = req.body;
    const file = req.file;

    const cropData = {
      farmerId: req.user._id,
      name,
      description,
      price: parseFloat(price),
      quantityAvailable: parseInt(quantityAvailable),
      unit,
      ...(file && { image: `${config.HOST}/static/uploads/${file.filename}` }),
    };

    const newCrop = await CropModel.create(cropData);
    res.status(201).json({ msg: "Crop added successfully", crop: newCrop });
  })
);

// Manage Crops (Update Crop - Farmer only)
router.put(
  "/:id",
  uploadLocal.single("image"),
  validate(idValidater),
  asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.user;
    if (role !== "FARMER") {
      throw new BadRequest("Only farmers can manage crops");
    }

    const { id } = req.params;
    const { name, description, price, quantityAvailable, unit } = req.body;
    const file = req.file;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (quantityAvailable) updateData.quantityAvailable = parseInt(quantityAvailable);
    if (unit) updateData.unit = unit;
    if (file) updateData.image = `${config.HOST}/static/uploads/${file.filename}`;

    const crop = await CropModel.findOneAndUpdate(
      { _id: id, farmerId: req.user._id },
      updateData,
      { new: true }
    );

    if (!crop) {
      throw new BadRequest("Crop not found or you don't own it");
    }

    res.json({ msg: "Crop updated successfully", crop });
  })
);

// Delete Crop (Farmer only)
router.delete(
  "/:id",
  validate(idValidater),
  asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.user;
    if (role !== "FARMER") {
      throw new BadRequest("Only farmers can delete crops");
    }

    const { id } = req.params;
    const crop = await CropModel.findOneAndDelete({ _id: id, farmerId: req.user._id });

    if (!crop) {
      throw new BadRequest("Crop not found or you don't own it");
    }

    res.json({ msg: "Crop deleted successfully" });
  })
);

// View Crops (For Customers and Farmers)
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const crops = await CropModel.find({ quantityAvailable: { $gt: 0 } }).populate('farmerId', 'name email _id address'); // Only available crops
    res.json({ crops });
  })
);

// View My Crops (Farmer only)
router.get(
  "/my",
  asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.user;
    if (role !== "FARMER") {
      throw new BadRequest("Only farmers can view their crops");
    }

    const crops = await CropModel.find({ farmerId: req.user._id });
    res.json({ crops });
  })
);

export default router;