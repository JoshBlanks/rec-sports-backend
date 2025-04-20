import { Request, Response, NextFunction } from "express";

// Mock authentication middleware for testing
export const mockAuthentication = jest
  .fn()
  .mockImplementation((req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, no token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Set user based on token
    if (token === "admin-token") {
      (req as any).user = {
        id: "mock-admin-id",
        role: "admin",
      };
      next();
    } else if (token === "player-token") {
      (req as any).user = {
        id: "mock-player-id",
        role: "player",
      };
      next();
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, invalid token" });
    }
  });

// Mock authorization middleware for testing
export const mockAuthorization = jest
  .fn()
  .mockImplementation((...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;

      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Not authorized, no user found" });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `User role ${user.role} is not authorized to access this route`,
        });
      }

      next();
    };
  });

// For use in jest.mock calls
export const mockMiddleware = {
  protect: mockAuthentication,
  authorize: mockAuthorization,
};
