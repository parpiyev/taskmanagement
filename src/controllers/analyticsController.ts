import { Response } from "express";
import { Task } from "../models/Task";
import { User } from "../models/User";
import { AuthenticatedRequest, TaskAnalytics } from "../types";

export const getAnalytics = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Overall statistics
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ completed: true });
    const pendingTasks = totalTasks - completedTasks;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Tasks created and completed in the last week
    const tasksCreatedLastWeek = await Task.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    const tasksCompletedLastWeek = await Task.countDocuments({
      completed: true,
      updatedAt: { $gte: oneWeekAgo },
    });

    // Tasks by user with completion rates
    const tasksByUser = await Task.aggregate([
      {
        $group: {
          _id: "$user",
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: ["$completed", 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          _id: 0,
          user: "$_id",
          email: "$userInfo.email",
          totalTasks: 1,
          completedTasks: 1,
          completionRate: {
            $cond: [
              { $gt: ["$totalTasks", 0] },
              {
                $multiply: [
                  { $divide: ["$completedTasks", "$totalTasks"] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $sort: { totalTasks: -1 },
      },
    ]);

    // Tasks completion trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completionTrend = await Task.aggregate([
      {
        $match: {
          updatedAt: { $gte: thirtyDaysAgo },
          completed: true,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$updatedAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Task creation trend (last 30 days)
    const creationTrend = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const analytics: TaskAnalytics & any = {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      tasksByUser,
      tasksCreatedLastWeek,
      tasksCompletedLastWeek,
      completionTrend,
      creationTrend,
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching analytics",
    });
  }
};

export const getUserStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({
      user: userId,
      completed: true,
    });
    const pendingTasks = totalTasks - completedTasks;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTasks = await Task.countDocuments({
      user: userId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const recentCompletions = await Task.countDocuments({
      user: userId,
      completed: true,
      updatedAt: { $gte: thirtyDaysAgo },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
        },
        stats: {
          totalTasks,
          completedTasks,
          pendingTasks,
          completionRate: Math.round(completionRate * 100) / 100,
          recentTasks,
          recentCompletions,
        },
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user statistics",
    });
  }
};
