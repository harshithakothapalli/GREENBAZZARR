import asyncHandler from "../middlewares/AsyncHandler";
import { CookieOptions, Request, Response } from "express";
import { Router } from "express";

import {
  dbUserCheckV2,
  dbUserDelete,
  validate,
} from "../middlewares/Validator";
import {
  idValidater,
  loginValidator,
  roleParamsValidater,
  forgotPasswordValidator,
} from "../validators";
import config from "../config";
import { IBaseUser, farmer, customer } from "../models";
import { Role, RoleEnum } from "../types";
import bcrypt from "bcrypt";
import { BadRequest } from "../customErrors";
import {
  generateJwtToken,
  getModelByRole,
  getUserByRole,
  uploadFile,
  uploadLocal,
} from "../constants/lib";
import CONFIG from "../config";
import { File } from "buffer";

const router = Router();
router.get("/ping", (req, res) => {
  res.json({ msg: "user route working" });
});

type AddUser = IBaseUser & {
  role: Role;
  category?: string;
  child?: string;
  password?: string;
  mobile?: string;
  address?: string;
  photo?: string;
};

type ParamsWithId = {
  id: string;
};

type UserFilter = {
  role: Role;
  name?: string;
  email?: string;
  limit: string;
  password?: string;
  child?: string;
  page: string;
};

type ChangePassword = {
  newPassword: string;
  role: Role;
};

type UserFilterDropdown = {
  q: string;
  role: Role;
};

router.get(
  "/me",
  asyncHandler(async (req: Request, res: Response) => {
    const { _id: userId, role } = req.user;

    const model = getModelByRole(role);

    if (!model) {
      throw new BadRequest("Invalid role");
    }

    const user = await model.findById(userId);

    if (!user) {
      throw new BadRequest(`User with id ${userId} not found`);
    }

    res.json(user);
  })
);

router.get(
  "/farmers",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const farmers = await farmer.find({});
      res.json({ data:farmers });
    } catch (err) {
      console.log(err);
    }
  })
);

router.get(
  "/customers/",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const data = await customer.find({});

      res.json({ data });
    } catch (err) {
      console.log(err);
    }
  })
);

// get / filter users
router.get(
  "/dropdown",
  asyncHandler(async (req: Request, res: Response) => {
    const { q, role } = req.query as UserFilterDropdown;

    let toQuery = {};

    if (q) {
      toQuery = {
        ...toQuery,
        name: {
          $regex: q,
          $options: "i",
        },
        email: {
          $regex: q,
          $options: "i",
        },
      };
    }

    const modelToUse = getModelByRole(role);

    if (!modelToUse) {
      throw new BadRequest("Invalid role");
    }

    const users = await modelToUse.aggregate([
      { $match: toQuery },
      { $sort: { createdAt: -1 } },
      { $project: { _id: 1, name: 1 } },
    ]);

    res.json(users);
  })
);

// login route
router.post(
  "/login",
  validate(loginValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, role } = req.body as AddUser;

    const user: any = await getUserByRole(role, { email });

    if (!user) {
      throw new BadRequest(`No ${role} found with email ${email}`);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new BadRequest("Invalid password");
    }

    const token = generateJwtToken(user as IBaseUser, role);

    res.cookie("token", token, CONFIG.COOKIE_SETTINGS as CookieOptions);

    const toSendUser = {
      name: user.name,
      email: user.email,
      _id: user._id,
      role: role,
    };

    res.json({ msg: "Logged in successfully", user: toSendUser });
  })
);

// login route
router.post(
  "/change-password",
  validate(forgotPasswordValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { newPassword, role } = req.body as ChangePassword;
    const { email } = req.user;

    const user = await getUserByRole(role, { email });

    if (!user) {
      throw new BadRequest(`No ${role} found with email ${email}`);
    }

    const isMatch = await bcrypt.compare(newPassword, user.password);

    if (isMatch) {
      throw new BadRequest(
        "New password cannot be the same as the old password"
      );
    }

    const password = await bcrypt.hash(newPassword, config.SALT_ROUNDS);

    await user.updateOne({ password });

    res.json({ msg: "Password changed successfully" });
  })
);

router.post(
  "/register",
  uploadLocal.single("photo"),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email, role, password, mobile, address } = req.body as AddUser;
    const file = req.file;

    if (!password) {
      throw new BadRequest("Password is required");
    }

    const [existingFarmer, existingCustomer] = await Promise.all([
      farmer.findOne({ email }),
      customer.findOne({ email }),
    ]);

    if (existingFarmer || existingCustomer) {
      throw new BadRequest("Email is already in use");
    }

    const hashedPassword = await bcrypt.hash(password, config.SALT_ROUNDS);
    let newUser;
    let msg = "";

    const commonUserData = {
      name,
      email,
      password: hashedPassword,
      mobile,
      address,
      ...(file && {
        fileType: file.mimetype,
        photo: `${CONFIG.HOST}/static/uploads/${file.filename}`,
      }),
    };

    switch (role) {
      case RoleEnum.FARMER:
        newUser = await farmer.create(commonUserData);
        msg = "Farmer created successfully";
        break;
      case RoleEnum.CUSTOMER:
        newUser = await customer.create(commonUserData);
        msg = "customer created successfully";
        break;
      default:
        throw new BadRequest("Invalid role");
    }

    res.status(201).json({ msg, userId: newUser._id });
  })
);

router.put(
  "/:id",
  uploadLocal.single("photo"),
  validate(idValidater),
  dbUserCheckV2(),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    let { name, email, role, mobile, address, password } = req.body;

    // Hash new password if provided
    if (password) {
      password = await bcrypt.hash(password, config.SALT_ROUNDS);
    }

    // Handle file upload if provided
    const file = req.file;
    const updateData: any = {
      ...(name && { name }),
      ...(email && { email }),
      ...(mobile && { mobile }),
      ...(address && { address }),
      ...(password && { password }),
    };

    if (file) {
      updateData.photo = `${config.HOST}/static/uploads/${file.filename}`;
      updateData.fileType = file.mimetype;
    }

    // Update based on role
    let result;
    switch (role) {
      case RoleEnum.FARMER:
        result = await farmer.findByIdAndUpdate(id, updateData, { new: true });
        break;
      case RoleEnum.CUSTOMER:
        result = await customer.findByIdAndUpdate(id, updateData, { new: true });
        break;
      default:
        throw new BadRequest("Invalid role provided");
    }

    if (!result) {
      throw new BadRequest("User not found or update failed");
    }

    res.json({ msg: "User updated successfully", updatedUser: result });
  })
);

// delete route
router.delete(
  "/:id",
  validate(idValidater),
  validate(roleParamsValidater),
  dbUserDelete(true),
  asyncHandler(async (_: Request, res: Response) => {
    res.json({ msg: "User deleted successfully" });
  })
);

export default router;
