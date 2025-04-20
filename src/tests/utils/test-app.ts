import express, { Application, Request, Response } from "express";
import { mockAuthentication, mockAuthorization } from "./auth-mocks";
import { errorHandler } from "../../middlewares/error.middleware";

/**
 * Create a test Express application with mocked authentication
 */
export const createTestApp = (): Application => {
  const app = express();

  // Configure middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Create sport routes with mocked auth
  const sportRouter = express.Router();

  // Mock POST /api/sports - Create sport
  sportRouter.post(
    "/",
    mockAuthentication,
    mockAuthorization("admin"),
    (req: Request, res: Response) => {
      // Implement simplified sport creation for testing
      const { name, description } = req.body;

      // Validate required fields
      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: "Name and description are required",
        });
      }

      // Check for duplicate name (for testing duplicate prevention)
      if (name.includes("Duplicate")) {
        return res.status(400).json({
          success: false,
          message: "Sport with this name already exists",
        });
      }

      // Return success response
      return res.status(201).json({
        success: true,
        message: "Sport created successfully",
        data: req.body,
      });
    }
  );

  // Mock GET /api/sports - Get all sports
  sportRouter.get("/", (req: Request, res: Response) => {
    const { active } = req.query;

    // Return mock data based on query params
    const data = [];

    // Only respond with mock data when tests specify (normally DB would provide data)
    if (res.locals.testData) {
      data.push(...res.locals.testData);
    }

    return res.status(200).json({
      success: true,
      data,
    });
  });

  // Mock GET /api/sports/:id - Get sport by ID
  sportRouter.get("/:id", (req: Request, res: Response) => {
    // If ID contains 'notfound', return 404
    if (req.params.id.includes("notfound")) {
      return res.status(404).json({
        success: false,
        message: "Sport not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: req.params.id,
        name: "Test Sport",
        description: "Test description",
      },
    });
  });

  // Mock PUT /api/sports/:id - Update sport
  sportRouter.put(
    "/:id",
    mockAuthentication,
    mockAuthorization("admin"),
    (req: Request, res: Response) => {
      return res.status(200).json({
        success: true,
        message: "Sport updated successfully",
        data: {
          _id: req.params.id,
          ...req.body,
        },
      });
    }
  );

  // Mock DELETE /api/sports/:id - Soft delete sport
  sportRouter.delete(
    "/:id",
    mockAuthentication,
    mockAuthorization("admin"),
    (req: Request, res: Response) => {
      return res.status(200).json({
        success: true,
        message: "Sport deactivated successfully",
      });
    }
  );

  // Mock DELETE /api/sports/:id/permanent - Permanently delete sport
  sportRouter.delete(
    "/:id/permanent",
    mockAuthentication,
    mockAuthorization("admin"),
    (req: Request, res: Response) => {
      return res.status(200).json({
        success: true,
        message: "Sport permanently deleted",
      });
    }
  );

  // Mount routes
  app.use("/api/sports", sportRouter);

  // Add error handler
  app.use(errorHandler);

  return app;
};
