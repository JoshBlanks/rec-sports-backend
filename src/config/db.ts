import mongoose from "mongoose";

/**
 * Connect to MongoDB
 */
export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/sports-league";

    const options = {
      // Connection options
    };

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit with failure
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
};
