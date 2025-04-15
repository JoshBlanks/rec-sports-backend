import request from "supertest";
import mongoose from "mongoose";
import app from "../../server";
import Sport from "../../models/sport.model";
import { clearDatabase, getAdminToken, getPlayerToken } from "../utils/db";

describe("Sport API Routes", () => {
  // Admin token for protected routes
  const adminToken = getAdminToken();
  // Player token for testing authorization
  const playerToken = getPlayerToken();

  // Clear database before each test
  beforeEach(async () => {
    await clearDatabase();
  });

  // Sample sport data for tests
  const sampleSport = {
    name: "Test Sport",
    description: "A test sport for API testing",
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

  describe("POST /api/sports", () => {
    it("should create a new sport when admin authenticated", async () => {
      const res = await request(app)
        .post("/api/sports")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(sampleSport);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(sampleSport.name);
    });

    it("should not allow creation without authentication", async () => {
      const res = await request(app).post("/api/sports").send(sampleSport);

      expect(res.status).toBe(401);
    });

    it("should not allow non-admin users to create sports", async () => {
      const res = await request(app)
        .post("/api/sports")
        .set("Authorization", `Bearer ${playerToken}`)
        .send(sampleSport);

      expect(res.status).toBe(403);
    });

    it("should validate required fields", async () => {
      const invalidSport = {
        description: "Missing required fields",
      };

      const res = await request(app)
        .post("/api/sports")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidSport);

      expect(res.status).toBe(400);
    });

    it("should prevent duplicate sport names", async () => {
      // Create first sport
      await request(app)
        .post("/api/sports")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(sampleSport);

      // Try to create sport with same name
      const res = await request(app)
        .post("/api/sports")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(sampleSport);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/sports", () => {
    it("should get all sports", async () => {
      // Create a couple of sports
      const sport1 = new Sport(sampleSport);
      await sport1.save();

      const sport2 = new Sport({
        ...sampleSport,
        name: "Another Sport",
      });
      await sport2.save();

      // Test endpoint
      const res = await request(app).get("/api/sports");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it("should filter by active status", async () => {
      // Create an active sport
      const activeSport = new Sport(sampleSport);
      await activeSport.save();

      // Create an inactive sport
      const inactiveSport = new Sport({
        ...sampleSport,
        name: "Inactive Sport",
        isActive: false,
      });
      await inactiveSport.save();

      // Test endpoint with active=true filter
      const res = await request(app).get("/api/sports?active=true");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe(activeSport.name);
    });
  });

  describe("GET /api/sports/:id", () => {
    it("should get a sport by ID", async () => {
      // Create a sport
      const sport = new Sport(sampleSport);
      await sport.save();

      // Test endpoint
      const res = await request(app).get(`/api/sports/${sport._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(sport.name);
    });

    it("should return 404 for non-existent ID", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/sports/${nonExistentId}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/sports/:id", () => {
    it("should update a sport when admin authenticated", async () => {
      // Create a sport
      const sport = new Sport(sampleSport);
      await sport.save();

      // Update data
      const updateData = {
        description: "Updated description",
        settings: {
          ...sampleSport.settings,
          periods: 4,
        },
      };

      // Test endpoint
      const res = await request(app)
        .put(`/api/sports/${sport._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe(updateData.description);
      expect(res.body.data.settings.periods).toBe(updateData.settings.periods);
    });

    it("should not allow update without authentication", async () => {
      // Create a sport
      const sport = new Sport(sampleSport);
      await sport.save();

      // Test endpoint without token
      const res = await request(app)
        .put(`/api/sports/${sport._id}`)
        .send({ description: "Unauthorized update" });

      expect(res.status).toBe(401);
    });

    it("should not allow non-admin users to update sports", async () => {
      // Create a sport
      const sport = new Sport(sampleSport);
      await sport.save();

      // Test endpoint with player token
      const res = await request(app)
        .put(`/api/sports/${sport._id}`)
        .set("Authorization", `Bearer ${playerToken}`)
        .send({ description: "Unauthorized update" });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/sports/:id", () => {
    it("should soft delete a sport when admin authenticated", async () => {
      // Create a sport
      const sport = new Sport(sampleSport);
      await sport.save();

      // Test delete endpoint
      const res = await request(app)
        .delete(`/api/sports/${sport._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify the sport is marked as inactive but still exists
      const updatedSport = await Sport.findById(sport._id);
      expect(updatedSport).toBeTruthy();
      expect(updatedSport?.isActive).toBe(false);
    });

    it("should not allow delete without authentication", async () => {
      // Create a sport
      const sport = new Sport(sampleSport);
      await sport.save();

      // Test endpoint without token
      const res = await request(app).delete(`/api/sports/${sport._id}`);

      expect(res.status).toBe(401);
    });

    it("should not allow non-admin users to delete sports", async () => {
      // Create a sport
      const sport = new Sport(sampleSport);
      await sport.save();

      // Test endpoint with player token
      const res = await request(app)
        .delete(`/api/sports/${sport._id}`)
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/sports/:id/permanent", () => {
    it("should permanently delete a sport when admin authenticated", async () => {
      // Create a sport
      const sport = new Sport(sampleSport);
      await sport.save();

      // Test permanent delete endpoint
      const res = await request(app)
        .delete(`/api/sports/${sport._id}/permanent`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify the sport is actually deleted
      const deletedSport = await Sport.findById(sport._id);
      expect(deletedSport).toBeNull();
    });
  });
});
