import jsonwebtoken from "jsonwebtoken";

declare module "jsonwebtoken" {
  export interface JwtPayload {
    id: string;
    role: string;
    iat?: number;
    exp?: number;
  }
}
