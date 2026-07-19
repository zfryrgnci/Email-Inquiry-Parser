import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../server.js"; // Note: .ts is run via vitest so .js or .ts works, but the file is server.ts

describe("POST /api/parse", () => {
  it("should return 400 if emailBody is missing", async () => {
    const response = await request(app)
      .post("/api/parse")
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("Missing or invalid emailBody parameter");
  });

  it("should return mocked successful parsing data", async () => {
    const response = await request(app)
      .post("/api/parse")
      .send({ emailBody: "Hello, this is a test email." });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("client_name", "Mock Client");
    expect(response.body).toHaveProperty("budget", "$1000");
    expect(response.body).toHaveProperty("priority", "High");
  });
});
