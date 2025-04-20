import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Setup test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRE = "1h";

// This file runs before all tests - setup global test configuration here
