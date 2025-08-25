import { Request } from "express";
import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ITask extends Document {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  tasksByUser: Array<{
    user: string;
    email: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  }>;
  tasksCreatedLastWeek: number;
  tasksCompletedLastWeek: number;
}
