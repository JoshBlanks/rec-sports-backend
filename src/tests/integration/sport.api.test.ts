import request from "supertest";
import { Application } from "express";
import { createTestApp } from "../utils/test-app";
import { getAdminToken, getPlayerToken } from "../utils/db";

describe("Sport API Routes", () => {
  let app: Application;

  // Create test app before tests
  beforeAll(() => {
    app = createTestApp();
  });

  // Admin token for protected routes
  const adminToken = getAdminToken();
  // Player token for testing authorization
  const playerToken = getPlayerToken();

  // Sample sport data for tests
  const createSampleSport = (name = `Test Sport ${Date.now()}`) => ({
    name,
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
  });

  describe("POST /api/sports", () => {
    it("should create a new sport when admin authenticated", async () => {
      const sportData = createSampleSport();

      const res = await request(app)
        .post("/api/sports")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(sportData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(sportData.name);
    });

    it("should not allow creation without authentication", async () => {
      const sportData = createSampleSport();

      const res = await request(app).post("/api/sports").send(sportData);

      expect(res.status).toBe(401);
    });

    it("should not allow non-admin users to create sports", async () => {
      const sportData = createSampleSport();

      const res = await request(app)
        .post("/api/sports")
        .set("Authorization", `Bearer ${playerToken}`)
        .send(sportData);

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
      // Create a sport with a name that will trigger the duplicate check in test-app.ts
      const sportData = createSampleSport("Duplicate Sport");

      const res = await request(app)
        .post("/api/sports")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(sportData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/sports", () => {
    it("should get all sports", async () => {
      const res = await request(app).get("/api/sports");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should filter by active status", async () => {
      const res = await request(app).get("/api/sports?active=true");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /api/sports/:id", () => {
    it("should get a sport by ID", async () => {
      const testId = "test-id-123";

      const res = await request(app).get(`/api/sports/${testId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(testId);
    });

    it("should return 404 for non-existent ID", async () => {
      const res = await request(app).get(`/api/sports/notfound-123`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/sports/:id", () => {
    it("should update a sport when admin authenticated", async () => {
      const testId = "test-id-456";
      const updateData = {
        description: "Updated description",
        settings: {
          periods: 4,
        },
      };

      const res = await request(app)
        .put(`/api/sports/${testId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe(updateData.description);
    });

    it("should not allow update without authentication", async () => {
      const res = await request(app)
        .put(`/api/sports/test-id`)
        .send({ description: "Unauthorized update" });

      expect(res.status).toBe(401);
    });

    it("should not allow non-admin users to update sports", async () => {
      const res = await request(app)
        .put(`/api/sports/test-id`)
        .set("Authorization", `Bearer ${playerToken}`)
        .send({ description: "Unauthorized update" });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/sports/:id", () => {
    it("should soft delete a sport when admin authenticated", async () => {
      const res = await request(app)
        .delete(`/api/sports/test-id`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should not allow delete without authentication", async () => {
      const res = await request(app).delete(`/api/sports/test-id`);

      expect(res.status).toBe(401);
    });

    it("should not allow non-admin users to delete sports", async () => {
      const res = await request(app)
        .delete(`/api/sports/test-id`)
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/sports/:id/permanent", () => {
    it("should permanently delete a sport when admin authenticated", async () => {
      const res = await request(app)
        .delete(`/api/sports/test-id/permanent`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should not allow permanent delete without authentication", async () => {
      const res = await request(app).delete(`/api/sports/test-id/permanent`);

      expect(res.status).toBe(401);
    });

    it("should not allow non-admin users to permanently delete sports", async () => {
      const res = await request(app)
        .delete(`/api/sports/test-id/permanent`)
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.status).toBe(403);
    });
  });
});
