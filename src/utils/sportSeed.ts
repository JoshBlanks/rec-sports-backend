import mongoose from "mongoose";
import dotenv from "dotenv";
import Sport from "../models/sport.model";

// Load environment variables
dotenv.config();

// Sample sports data
const sportsData = [
  {
    name: "Volleyball",
    description: "Indoor 6v6 volleyball leagues",
    minPlayers: 8,
    maxPlayers: 15,
    minPlayersPerGame: 6,
    maxPlayersPerGame: 6,
    genderRequirements: {
      minFemale: 2, // At least 2 female players on court
      minMale: 2, // At least 2 male players on court
      maxOnField: 6, // 6 players on court total
    },
    settings: {
      periods: 3,
      periodDuration: 0, // Point-based scoring
      scoringSystem: "best-of-3-sets",
      additionalRules: [
        "Rally scoring to 25 points",
        "Must win by 2 points",
        "Third set to 15 points if needed",
      ],
    },
  },
  {
    name: "Kickball",
    description: "Outdoor 10v10 kickball leagues",
    minPlayers: 12,
    maxPlayers: 20,
    minPlayersPerGame: 8,
    maxPlayersPerGame: 10,
    genderRequirements: {
      minFemale: 4, // At least 4 female players on field
      minMale: 4, // At least 4 male players on field
      maxOnField: 10, // 10 players on field total
    },
    settings: {
      periods: 7,
      periodDuration: 0, // Innings-based
      scoringSystem: "runs",
      additionalRules: [
        "7 innings per game",
        "Max 10 runs per inning",
        "Mercy rule: 15 run difference after 5 innings",
      ],
    },
  },
  {
    name: "Basketball",
    description: "5v5 basketball leagues",
    minPlayers: 7,
    maxPlayers: 12,
    minPlayersPerGame: 5,
    maxPlayersPerGame: 5,
    genderRequirements: {
      minFemale: 2, // At least 2 female players on court
      minMale: 2, // At least 2 male players on court
      maxOnField: 5, // 5 players on court total
    },
    settings: {
      periods: 4,
      periodDuration: 10, // 10-minute quarters
      scoringSystem: "points",
      additionalRules: [
        "4 ten-minute quarters",
        "Running clock except for the last 2 minutes of each half",
        "Overtime: 3 minutes",
      ],
    },
  },
  {
    name: "Soccer",
    description: "Outdoor 7v7 soccer leagues",
    minPlayers: 10,
    maxPlayers: 14,
    minPlayersPerGame: 5,
    maxPlayersPerGame: 7,
    genderRequirements: {
      minFemale: 3, // At least 3 female players on field
      minMale: 3, // At least 3 male players on field
      maxOnField: 7, // 7 players on field total
    },
    settings: {
      periods: 2,
      periodDuration: 25, // 25-minute halves
      scoringSystem: "goals",
      additionalRules: [
        "Two 25-minute halves",
        "No offsides",
        "Unlimited substitutions on the fly",
      ],
    },
  },
];

/**
 * Seed sports data
 */
const seedSports = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/sports-league";
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected for seeding sports");

    // Clear existing sports (optional)
    // Uncomment to clear existing sports before seeding
    // await Sport.deleteMany({});
    // console.log('Existing sports cleared');

    // Check if sports already exist
    for (const sportData of sportsData) {
      const existingSport = await Sport.findOne({ name: sportData.name });

      if (existingSport) {
        console.log(`Sport "${sportData.name}" already exists - skipping`);
      } else {
        // Create new sport
        await Sport.create(sportData);
        console.log(`Sport "${sportData.name}" created successfully`);
      }
    }

    console.log("Sports seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding sports:", error);
    process.exit(1);
  }
};

// Run the seeder
seedSports();
