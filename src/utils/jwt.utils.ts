import jwt from "jsonwebtoken";

/**
 * JWT Token payload interface
 */
export interface JwtPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Sign a new JWT token
 */
export const signToken = (
  payload: JwtPayload,
  expiresIn: string = "30d"
): string => {
  const secret = process.env.JWT_SECRET || "your_jwt_secret_change_in_prod";
  // Use type assertion to bypass TypeScript type issues
  return (jwt as any).sign(payload, secret, { expiresIn });
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET || "your_jwt_secret_change_in_prod";
  // Use type assertion to bypass TypeScript type issues
  return (jwt as any).verify(token, secret) as JwtPayload;
};
