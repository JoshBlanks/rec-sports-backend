import mongoose from "mongoose";
import Sport from "../../models/sport.model";
import { clearDatabase } from "../utils/db";

describe("Sport Model", () => {
  // Clear the database before each test
  beforeEach(async () => {
    await clearDatabase();
  });

  // Valid sport data for tests
  const validSportData = {
    name: "Test Sport",
    description: "A test sport for unit testing",
    minPlayers: 8,
    maxPlayers: 15,
    minPlayersPerGame: 6,
    maxPlayersPerGame: 6,
    genderRequirements: {
      minFemale: 2,
      minMale: 2,
      maxOnField: 6,
    },
    settings: {
      periods: 2,
      periodDuration: 20,
      scoringSystem: "points",
      additionalRules: ["Test rule 1", "Test rule 2"],
    },
  };

  it("should create a sport with valid data", async () => {
    // Create a new sport
    const sport = new Sport(validSportData);
    const savedSport = await sport.save();

    // Get the saved sport
    const foundSport = await Sport.findById(savedSport._id);

    // Assertions
    expect(foundSport).toBeTruthy();
    expect(foundSport?.name).toBe(validSportData.name);
    expect(foundSport?.description).toBe(validSportData.description);
    expect(foundSport?.genderRequirements.minFemale).toBe(
      validSportData.genderRequirements.minFemale
    );
    expect(foundSport?.genderRequirements.minMale).toBe(
      validSportData.genderRequirements.minMale
    );
    expect(foundSport?.genderRequirements.maxOnField).toBe(
      validSportData.genderRequirements.maxOnField
    );
  });

  it("should require name field", async () => {
    // Create sport without name
    const sport = new Sport({
      ...validSportData,
      name: undefined,
    });

    // Expect validation error
    await expect(sport.validate()).rejects.toThrow();
  });

  it("should require description field", async () => {
    // Create sport without description
    const sport = new Sport({
      ...validSportData,
      description: undefined,
    });

    // Expect validation error
    await expect(sport.validate()).rejects.toThrow();
  });

  it("should validate gender requirements", async () => {
    // Create sport where min female + min male > max on field
    const sport = new Sport({
      ...validSportData,
      genderRequirements: {
        minFemale: 4,
        minMale: 4,
        maxOnField: 6,
      },
    });

    // Expect validation error
    await expect(sport.validate()).rejects.toThrow();
  });

  it("should validate max players per game >= max on field", async () => {
    // Create sport where maxPlayersPerGame < maxOnField
    const sport = new Sport({
      ...validSportData,
      maxPlayersPerGame: 5,
      genderRequirements: {
        minFemale: 2,
        minMale: 2,
        maxOnField: 6,
      },
    });

    // Expect validation error
    await expect(sport.validate()).rejects.toThrow();
  });

  it("should validate min players >= min female + min male", async () => {
    // Create sport where minPlayers < minFemale + minMale
    const sport = new Sport({
      ...validSportData,
      minPlayers: 3,
      genderRequirements: {
        minFemale: 2,
        minMale: 2,
        maxOnField: 6,
      },
    });

    // Expect validation error
    await expect(sport.validate()).rejects.toThrow();
  });

  it("should create a sport with optional fields", async () => {
    // Create sport without optional fields
    const sportData = {
      name: "Minimal Sport",
      description: "A minimal sport for testing",
      minPlayers: 4,
      maxPlayers: 8,
      minPlayersPerGame: 4,
      maxPlayersPerGame: 4,
      genderRequirements: {
        minFemale: 1,
        minMale: 1,
        maxOnField: 4,
      },
    };

    const sport = new Sport(sportData);
    const savedSport = await sport.save();

    // Get the saved sport
    const foundSport = await Sport.findById(savedSport._id);

    // Assertions
    expect(foundSport).toBeTruthy();
    expect(foundSport?.name).toBe(sportData.name);
    expect(foundSport?.settings).toBeDefined();
    expect(foundSport?.isActive).toBe(true);
  });
});
