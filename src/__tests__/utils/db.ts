import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Singleton pattern for MongoDB memory server
let mongoServer: MongoMemoryServer;

/**
 * Connect to the in-memory database.
 */
export const connect = async (): Promise<void> => {
  // Close existing connection if any
  await mongoose.disconnect();

  // Create new MongoDB memory server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
};

/**
 * Drop database, close the connection and stop mongodb server.
 */
export const closeDatabase = async (): Promise<void> => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

/**
 * Remove all data from collections but keep the collections.
 */
export const clearDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Create a test admin user JWT token
 */
export const getAdminToken = (): string => {
  // For testing only - this is not a secure way to create tokens in production
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    { id: "admin-user-id", role: "admin" },
    process.env.JWT_SECRET || "test-jwt-secret",
    { expiresIn: "1h" }
  );
};

/**
 * Create a test player JWT token
 */
export const getPlayerToken = (): string => {
  // For testing only - this is not a secure way to create tokens in production
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    { id: "player-user-id", role: "player" },
    process.env.JWT_SECRET || "test-jwt-secret",
    { expiresIn: "1h" }
  );
};
