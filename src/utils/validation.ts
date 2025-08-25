import { Request, Response, NextFunction } from "express";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateTaskData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, description } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  if (!description || description.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Description is required",
    });
  }

  next();
};
