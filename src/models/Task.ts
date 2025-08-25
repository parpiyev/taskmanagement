import mongoose, { Schema } from "mongoose";
import { ITask } from "../types";

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
taskSchema.index({ user: 1, completed: 1 });
taskSchema.index({ createdAt: 1 });

export const Task = mongoose.model<ITask>("Task", taskSchema);
