import dotenv from "dotenv";
import { connect, closeDatabase } from "./utils/db";

// Load environment variables
dotenv.config();

// Setup test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRE = "1h";

// Setup before all tests
beforeAll(async () => {
  await connect();
});

// Cleanup after all tests
afterAll(async () => {
  await closeDatabase();
});
