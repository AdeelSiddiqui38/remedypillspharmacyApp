import { storage } from "./storage";
import { hashPassword } from "./auth";

export async function seedAdminUser() {
  try {
    // Check if admin already exists - skip seeding if already done
    const existing = await storage.getUserByUsername("admin");
    if (existing) {
      console.log("Admin user already exists, skipping seed");
      return;
    }

    const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    if (!adminPassword) {
      console.warn(
        "ADMIN_BOOTSTRAP_PASSWORD is not set - skipping admin seed. " +
          "Set ADMIN_BOOTSTRAP_PASSWORD in your environment to create the initial admin user.",
      );
      return;
    }

    // Only create admin if it doesn't exist
    await storage.createUser({
      username: "admin",
      password: await hashPassword(adminPassword),
      name: "Administrator",
      email: "admin@remedypills.ca",
      phone: null,
      dob: null,
      role: "admin",
      provider: "local",
      providerId: null,
      consentGiven: true,
      consentDate: new Date().toISOString(),
      lastLoginAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    console.log("Admin user created with username 'admin' and the password from ADMIN_BOOTSTRAP_PASSWORD");
  } catch (err) {
    console.error("Admin seed error:", err);
  }
}
