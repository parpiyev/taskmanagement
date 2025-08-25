import { Response } from "express";
import { Task } from "../models/Task";
import { AuthenticatedRequest } from "../types";
import mongoose, { FilterQuery } from "mongoose";

export const getTasks = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    let filter: FilterQuery<Record<string, any>> = {};

    if (req.user?.role !== "admin") {
      filter.user = req.user?._id;
    }

    if (req.user?.role === "admin" && req.query.userId) {
      filter.user = req.query.userId;
    }

    const tasks = await Task.find(filter)
      .populate("user", "email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tasks",
    });
  }
};

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description } = req.body;

    const task = new Task({
      title,
      description,
      user: req.user?._id,
    });

    await task.save();
    await task.populate("user", "email");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: {
        task,
      },
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating task",
    });
  }
};

export const getTask = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
      return;
    }

    let filter: any = { _id: id };

    // Regular users can only access their own tasks
    if (req.user?.role !== "admin") {
      filter.user = req.user?._id;
    }

    const task = await Task.findOne(filter).populate("user", "email");

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching task",
    });
  }
};

export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
      return;
    }

    let filter: any = { _id: id };

    // Regular users can only update their own tasks
    if (req.user?.role !== "admin") {
      filter.user = req.user?._id;
    }

    const task = await Task.findOne(filter);

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    await task.save();
    await task.populate("user", "email");

    res.json({
      success: true,
      message: "Task updated successfully",
      data: {
        task,
      },
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating task",
    });
  }
};

export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
      return;
    }

    let filter: any = { _id: id };

    // Regular users can only delete their own tasks
    if (req.user?.role !== "admin") {
      filter.user = req.user?._id;
    }

    const task = await Task.findOneAndDelete(filter);

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting task",
    });
  }
};

export const toggleTaskCompletion = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
      return;
    }

    let filter: any = { _id: id };

    // Regular users can only toggle their own tasks
    if (req.user?.role !== "admin") {
      filter.user = req.user?._id;
    }

    const task = await Task.findOne(filter);

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    task.completed = !task.completed;
    await task.save();
    await task.populate("user", "email");

    res.json({
      success: true,
      message: `Task marked as ${task.completed ? "completed" : "pending"}`,
      data: {
        task,
      },
    });
  } catch (error) {
    console.error("Toggle task completion error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating task",
    });
  }
};
