import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import { verifyToken, JwtPayload } from "../utils/jwt.utils";

// Interface for decoded JWT token
interface DecodedToken extends JwtPayload {}

/**
 * Middleware to protect routes - verifies JWT token
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  console.log("Auth headers:", req.headers.authorization);

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Extract token from Bearer token
    token = req.headers.authorization.split(" ")[1];
    console.log("Token found:", token);
  }

  // Make sure token exists
  if (!token) {
    console.log("No token provided");
    res
      .status(401)
      .json({ success: false, message: "Not authorized, no token provided" });
    return;
  }

  try {
    // Verify token
    const jwtSecret = process.env.JWT_SECRET || "test-jwt-secret";
    console.log("Using JWT secret:", jwtSecret);

    const decoded = verifyToken(token) as DecodedToken;
    console.log("Token decoded:", decoded);

    // Find user by id
    const user = await User.findById(decoded.id);
    console.log("User found:", !!user);

    // Make sure user still exists
    if (!user) {
      console.log("User not found for token");
      res
        .status(401)
        .json({ success: false, message: "Not authorized, user not found" });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      console.log("User account is disabled");
      res
        .status(401)
        .json({ success: false, message: "User account is disabled" });
      return;
    }

    // Add user to request object
    (req as any).user = {
      id: decoded.id,
      role: decoded.role,
    };
    console.log("User added to request:", (req as any).user);

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res
      .status(401)
      .json({ success: false, message: "Not authorized, token invalid" });
  }
};

/**
 * Middleware to restrict access to certain roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Get user from previous middleware
    const userRole = (req as any).user?.role;

    if (!userRole) {
      res
        .status(401)
        .json({ success: false, message: "Not authorized, no user role" });
      return;
    }

    // Check if user role is included in the roles array
    if (!roles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: `User role ${userRole} is not authorized to access this route`,
      });
      return;
    }

    next();
  };
};
