import express from "express";
import {
  createSport,
  getAllSports,
  getSportById,
  updateSport,
  deleteSport,
  permanentDeleteSport,
} from "../controllers/sport.controller";
import { protect, authorize } from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @route   POST /api/sports
 * @desc    Create a new sport
 * @access  Private/Admin
 */
router.post("/", protect, authorize("admin"), createSport);

/**
 * @route   GET /api/sports
 * @desc    Get all sports
 * @access  Public
 */
router.get("/", getAllSports);

/**
 * @route   GET /api/sports/:id
 * @desc    Get a specific sport by ID
 * @access  Public
 */
router.get("/:id", getSportById);

/**
 * @route   PUT /api/sports/:id
 * @desc    Update a sport
 * @access  Private/Admin
 */
router.put("/:id", protect, authorize("admin"), updateSport);

/**
 * @route   DELETE /api/sports/:id
 * @desc    Deactivate a sport (soft delete)
 * @access  Private/Admin
 */
router.delete("/:id", protect, authorize("admin"), deleteSport);

/**
 * @route   DELETE /api/sports/:id/permanent
 * @desc    Permanently delete a sport
 * @access  Private/Admin
 */
router.delete(
  "/:id/permanent",
  protect,
  authorize("admin"),
  permanentDeleteSport
);

export default router;
