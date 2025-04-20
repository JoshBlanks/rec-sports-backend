import { Request, Response, NextFunction } from "express";

/**
 * Error response interface
 */
interface ErrorResponse {
  success: boolean;
  error: string;
  message: string;
  stack?: string;
}

/**
 * Custom error handler middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err);

  // Default error object
  const error: ErrorResponse = {
    success: false,
    error: err.name || "Server Error",
    message: err.message || "Something went wrong",
  };

  // Mongoose validation error
  if (err.name === "ValidationError") {
    error.message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(", ");

    res.status(400).json(error);
    return;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.message = `Duplicate field value entered`;
    res.status(400).json(error);
    return;
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error.message = `Resource not found with id of ${err.value}`;
    res.status(404).json(error);
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token";
    res.status(401).json(error);
    return;
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Token expired";
    res.status(401).json(error);
    return;
  }

  // Add stack trace in development environment
  if (process.env.NODE_ENV === "development") {
    error.stack = err.stack;
  }

  // Send response with appropriate status code
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(error);
};
