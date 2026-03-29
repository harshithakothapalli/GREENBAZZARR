import { Router } from "express";
import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response } from "express";
import { order as OrderModel, orderHistory as OrderHistoryModel, crop as CropModel } from "../models";
import { validate } from "../middlewares/Validator";
import { orderValidator, idValidater } from "../validators";
import { BadRequest } from "../customErrors";

// Simulate payment function (In real, integrate payment gateway)
const simulatePayment = async (totalPrice: number) => {
  // Simulate success/failure
  return Math.random() > 0.1 ? "completed" : "failed";
};

const router = Router();

// Place Order (Customer only)
router.post(
  "/",
  validate(orderValidator), // Validate cropId, quantity
  asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.user;
    if (role !== "CUSTOMER") {
      throw new BadRequest("Only customers can place orders");
    }

    const { cropId, quantity } = req.body;
    const crop = await CropModel.findById(cropId);

    if (!crop || crop.quantityAvailable < quantity) {
      throw new BadRequest("Crop not available or insufficient quantity");
    }

    const totalPrice = crop.price * quantity;

    const orderData = {
      customerId: req.user._id,
      farmerId: crop.farmerId,
      cropId,
      quantity,
      totalPrice,
      status: "pending",
      paymentStatus: "pending",
    };

    const newOrder = await OrderModel.create(orderData);

    // Simulate payment
    const paymentStatus = await simulatePayment(totalPrice);
    if (paymentStatus === "failed") {
      await newOrder.updateOne({ paymentStatus: "failed", status: "cancelled" });
      throw new BadRequest("Payment failed");
    }

    await newOrder.updateOne({ paymentStatus: "completed" });

    // Update crop quantity
    await CropModel.findByIdAndUpdate(cropId, { $inc: { quantityAvailable: -quantity } });

    // Create history for both
    await OrderHistoryModel.create([
      {
        orderId: newOrder._id,
        userId: req.user._id,
        userType: "Customer",
        status: newOrder.status,
        paymentStatus: newOrder.paymentStatus,
      },
      {
        orderId: newOrder._id,
        userId: crop.farmerId,
        userType: "Farmer",
        status: newOrder.status,
        paymentStatus: newOrder.paymentStatus,
      },
    ]);

    res.status(201).json({ msg: "Order placed successfully", order: newOrder });
  })
);

// View/Manage Orders (Farmer views their orders)
router.get(
  "/farmer",
  asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.user;
    if (role !== "FARMER") {
      throw new BadRequest("Only farmers can view their orders");
    }

    const orders = await OrderModel.find({ farmerId: req.user._id }).populate("cropId").populate('customerId', 'name email _id address');;
    res.json({ orders });
  })
);

// View Orders (Customer views their orders)
router.get(
  "/customer",
  asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.user;
    if (role !== "CUSTOMER") {
      throw new BadRequest("Only customers can view their orders");
    }

    const orders = await OrderModel.find({ customerId: req.user._id }).populate("cropId").populate('farmerId', 'name email _id address');;
    res.json({ orders });
  })
);

// Update Order Status (Farmer only)
router.put(
  "/:id/status",
  validate(idValidater),
  asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.user;
    if (role !== "FARMER") {
      throw new BadRequest("Only farmers can update order status");
    }

    const { id } = req.params;
    const { status } = req.body; // e.g., "confirmed", "shipped", "delivered", "cancelled"

    const order = await OrderModel.findOneAndUpdate(
      { _id: id, farmerId: req.user._id },
      { status },
      { new: true }
    );

    if (!order) {
      throw new BadRequest("Order not found or you don't own it");
    }

    // Update history
    await OrderHistoryModel.updateMany(
      { orderId: id },
      { status: order.status }
    );

    if (status === "cancelled" && order.paymentStatus === "completed") {
      // Simulate refund if needed
    }

    res.json({ msg: "Order status updated", order });
  })
);

// View Order History (For both, based on role)
router.get(
  "/history",
  asyncHandler(async (req: Request, res: Response) => {
    const { role, _id: userId } = req.user;

    // Normalize role to match DB
    const userType = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    console.log('User Info:', req.user);
    console.log('Normalized userType:', userType);

    const history = await OrderHistoryModel.find({ userId, userType }).populate("orderId");
    console.log('Fetched History:', history);

    res.json({ history });
  })
);

// Get Total Payment Amount (For Customer or Farmer)
router.get(
  "/total-payment",
  asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.user;
    let totalAmount = 0;
    let paymentData = [];

    if (role === "CUSTOMER") {
      // For customer: Sum up totalPrice from all orders placed by the customer
      const orders = await OrderModel.find({ customerId: req.user._id }).select("totalPrice _id status paymentStatus createdAt");
      totalAmount = orders.reduce((sum, order) => sum + order.totalPrice, 0);
      paymentData = orders;
    } else if (role === "FARMER") {
      // For farmer: Sum up totalPrice from all orders received by the farmer
      const orders = await OrderModel.find({ farmerId: req.user._id }).select("totalPrice _id status paymentStatus createdAt");
      totalAmount = orders.reduce((sum, order) => sum + order.totalPrice, 0);
      paymentData = orders;
    } else {
      throw new BadRequest("Only customers or farmers can view the total payment amount");
    }

    res.json({ totalAmount, paymentData });
  })
);



// View Order Status (Specific order)
router.get(
  "/:id",
  validate(idValidater),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { _id: userId, role } = req.user;

    const order = await OrderModel.findById(id);

    if (!order || (order.customerId.toString() !== userId.toString() && order.farmerId.toString() !== userId.toString())) {
      throw new BadRequest("Order not found or access denied");
    }

    res.json({ order });
  })
);

export default router;













