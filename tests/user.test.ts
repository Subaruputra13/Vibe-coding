import { describe, it, expect, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { userRoutes } from "../src/routes/user-routes";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";

const app = new Elysia().use(userRoutes);

describe("User API", () => {
  beforeEach(async () => {
    await db.delete(sessions);
    await db.delete(users);
  });

  describe("POST /api/users (Register)", () => {
    it("should register a new user successfully", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      const registerData = (await response.json()) as any;
      expect(registerData.status).toBe("ok");
    });

    it("should fail if email is already registered", async () => {
      // Register first user
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
          }),
        })
      );

      // Try to register same email
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Another User",
            email: "test@example.com",
            password: "password456",
          }),
        })
      );

      expect(response.status).toBe(400);
      const errorData = (await response.json()) as any;
      expect(errorData.status).toBe("error");
      expect(errorData.message).toBe("Email sudah terdaftar");
    });

    it("should fail validation for invalid payload", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "",
            email: "invalid-email",
            password: "123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      // Pre-register a user for login tests
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Login User",
            email: "login@example.com",
            password: "password123",
          }),
        })
      );
    });

    it("should login successfully with correct credentials", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "login@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      const loginResult = (await response.json()) as any;
      expect(loginResult.data).toBeDefined();
    });

    it("should fail with wrong password", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "login@example.com",
            password: "wrongpassword",
          }),
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("Protected Routes (Current & Logout)", () => {
    let token: string;

    beforeEach(async () => {
      // Register and login to get a token
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Auth User",
            email: "auth@example.com",
            password: "password123",
          }),
        })
      );

      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "auth@example.com",
            password: "password123",
          }),
        })
      );
      const loginData = (await loginRes.json()) as any;
      token = loginData.data;
    });

    it("should get current user with valid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(200);
      const currentUserData = (await response.json()) as any;
      expect(currentUserData.data.email).toBe("auth@example.com");
    });

    it("should fail to get current user with invalid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "POST",
          headers: {
            "Authorization": `Bearer invalid-token`,
          },
        })
      );

      expect(response.status).toBe(401);
    });

    it("should logout successfully", async () => {
      const logoutRes = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
      );

      expect(logoutRes.status).toBe(200);
      const logoutResult = (await logoutRes.json()) as any;
      expect(logoutResult.data).toBe("Berhasil Logout");

      // Verify token is no longer valid
      const currentRes = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
      );
      expect(currentRes.status).toBe(401);
    });
  });
});
