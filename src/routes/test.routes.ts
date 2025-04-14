import express, { Request, Response } from "express";
import User from "../models/user.model";

const router = express.Router();

/**
 * @route GET /api/test/db
 * @desc Test database connection
 * @access Public
 */
router.get("/db", async (req: Request, res: Response) => {
  try {
    // Count users in the database
    const count = await User.countDocuments();

    // Return success response
    res.status(200).json({
      success: true,
      message: "Database connection is working",
      data: { userCount: count },
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      success: false,
      message: "Error testing database connection",
      error: (error as Error).message,
    });
  }
});

/**
 * @route POST /api/test/user
 * @desc Create a test user
 * @access Public
 */
router.post("/user", async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName } = req.body;

    // Validate input
    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, firstName, and lastName",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const user = await User.create({
      email,
      firstName,
      lastName,
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: "Test user created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Create test user error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating test user",
      error: (error as Error).message,
    });
  }
});

export default router;
