import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "../src/services/auth.data.js";
import { signAuthToken } from "../src/middleware/auth.middleware.js";

describe("password hashing", () => {
  it("verifies a matching password", async () => {
    const hash = await hashPassword("super-secret-1");
    expect(await verifyPassword("super-secret-1", hash)).toBe(true);
  });

  it("rejects a non-matching password", async () => {
    const hash = await hashPassword("super-secret-1");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("never stores the password in plain text", async () => {
    const hash = await hashPassword("super-secret-1");
    expect(hash).not.toBe("super-secret-1");
  });
});

describe("auth tokens", () => {
  it("round-trips a signed token", () => {
    const token = signAuthToken({ sub: "user-1", role: "student", rollNo: "21B81A0501" });
    const payload = jwt.verify(token, process.env["JWT_SECRET"] ?? "dev_secret_change_in_production") as {
      sub: string;
      role: string;
      rollNo: string;
    };
    expect(payload.sub).toBe("user-1");
    expect(payload.role).toBe("student");
    expect(payload.rollNo).toBe("21B81A0501");
  });

  it("rejects a token signed with a different secret", () => {
    const token = jwt.sign({ sub: "user-1", role: "student", rollNo: "21B81A0501" }, "a-different-secret");
    expect(() =>
      jwt.verify(token, process.env["JWT_SECRET"] ?? "dev_secret_change_in_production"),
    ).toThrow();
  });

  it("rejects an expired token", () => {
    const secret = process.env["JWT_SECRET"] ?? "dev_secret_change_in_production";
    const token = jwt.sign({ sub: "user-1", role: "student", rollNo: "21B81A0501" }, secret, {
      expiresIn: -1,
    });
    expect(() => jwt.verify(token, secret)).toThrow();
  });
});
