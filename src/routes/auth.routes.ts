import express from "express";
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get("/me", protect, getMe);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Forgot password
 * @access  Public
 */
router.post("/forgot-password", forgotPassword);

/**
 * @route   PUT /api/auth/reset-password/:resettoken
 * @desc    Reset password
 * @access  Public
 */
router.put("/reset-password/:resettoken", resetPassword);

export default router;
