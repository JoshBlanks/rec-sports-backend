import { Request, Response } from "express";
import Sport from "../models/sport.model";

/**
 * @desc    Create a new sport
 * @route   POST /api/sports
 * @access  Private/Admin
 */
export const createSport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      minPlayers,
      maxPlayers,
      minPlayersPerGame,
      maxPlayersPerGame,
      genderRequirements,
      settings,
    } = req.body;

    // Check if sport already exists
    const existingSport = await Sport.findOne({ name });
    if (existingSport) {
      res.status(400).json({
        success: false,
        message: "Sport with this name already exists",
      });
      return;
    }

    // Create new sport
    const sport = await Sport.create({
      name,
      description,
      minPlayers,
      maxPlayers,
      minPlayersPerGame,
      maxPlayersPerGame,
      genderRequirements,
      settings,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Sport created successfully",
      data: sport,
    });
  } catch (error) {
    if ((error as any).name === "ValidationError") {
      // Handle validation errors
      const messages = Object.values((error as any).errors).map(
        (err: any) => err.message
      );
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    } else {
      console.error("Create sport error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating sport",
        error: (error as Error).message,
      });
    }
  }
};

/**
 * @desc    Get all sports
 * @route   GET /api/sports
 * @access  Public
 */
export const getAllSports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract query parameters
    const { active } = req.query;

    // Build query
    const query: any = {};

    // Filter by active status if provided
    if (active !== undefined) {
      query.isActive = active === "true";
    }

    // Execute query
    const sports = await Sport.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: sports.length,
      data: sports,
    });
  } catch (error) {
    console.error("Get sports error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving sports",
      error: (error as Error).message,
    });
  }
};

/**
 * @desc    Get a specific sport by ID
 * @route   GET /api/sports/:id
 * @access  Public
 */
export const getSportById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sport = await Sport.findById(req.params.id);

    if (!sport) {
      res.status(404).json({ success: false, message: "Sport not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: sport,
    });
  } catch (error) {
    console.error("Get sport error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving sport",
      error: (error as Error).message,
    });
  }
};

/**
 * @desc    Update a sport
 * @route   PUT /api/sports/:id
 * @access  Private/Admin
 */
export const updateSport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Find sport by ID
    let sport = await Sport.findById(req.params.id);

    if (!sport) {
      res.status(404).json({ success: false, message: "Sport not found" });
      return;
    }

    // Update the sport
    sport = await Sport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Sport updated successfully",
      data: sport,
    });
  } catch (error) {
    if ((error as any).name === "ValidationError") {
      // Handle validation errors
      const messages = Object.values((error as any).errors).map(
        (err: any) => err.message
      );
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    } else {
      console.error("Update sport error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating sport",
        error: (error as Error).message,
      });
    }
  }
};

/**
 * @desc    Delete a sport
 * @route   DELETE /api/sports/:id
 * @access  Private/Admin
 */
export const deleteSport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sport = await Sport.findById(req.params.id);

    if (!sport) {
      res.status(404).json({ success: false, message: "Sport not found" });
      return;
    }

    // Instead of deleting, set isActive to false
    sport.isActive = false;
    await sport.save();

    res.status(200).json({
      success: true,
      message: "Sport deactivated successfully",
    });
  } catch (error) {
    console.error("Delete sport error:", error);
    res.status(500).json({
      success: false,
      message: "Error deactivating sport",
      error: (error as Error).message,
    });
  }
};

/**
 * @desc    Permanently delete a sport (use with caution)
 * @route   DELETE /api/sports/:id/permanent
 * @access  Private/Admin
 */
export const permanentDeleteSport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sport = await Sport.findById(req.params.id);

    if (!sport) {
      res.status(404).json({ success: false, message: "Sport not found" });
      return;
    }

    // Permanently delete the sport
    await Sport.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Sport permanently deleted",
    });
  } catch (error) {
    console.error("Permanent delete sport error:", error);
    res.status(500).json({
      success: false,
      message: "Error permanently deleting sport",
      error: (error as Error).message,
    });
  }
};
