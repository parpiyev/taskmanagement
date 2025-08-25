import { Request, Response } from "express";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { User } from "../models/User";
import { config } from "../config";
import { validateEmail, validatePassword } from "../utils/validation";

const generateToken = (userId: string): string => {
  const payload = { userId };
  const secret = config.jwtSecret as Secret;
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, options);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
      return;
    }

    if (!validatePassword(password)) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
      return;
    }

    const user = new User({
      email,
      password,
      role: role === "admin" ? "admin" : "user",
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    res.json({
      success: true,
      data: {
        user: authReq.user,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
