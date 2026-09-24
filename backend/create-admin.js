require("dotenv").config();

const bcrypt = require("bcrypt");
const db = require("./config/db");

async function createAdmin() {
  try {
    const fullName = "Jemal Seid";
    const username = "admin";
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      console.error("❌ ADMIN_PASSWORD is missing from .env");
      process.exit(1);
    }

    if (password === "CHANGE_THIS_PASSWORD") {
      console.error("❌ Please set a real ADMIN_PASSWORD in .env first.");
      process.exit(1);
    }

    if (password.length < 8) {
      console.error("❌ ADMIN_PASSWORD must be at least 8 characters.");
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [existingAdmins] = await db.query(
      "SELECT id FROM admins WHERE username = ?",
      [username]
    );

    if (existingAdmins.length > 0) {
      console.log("⚠️ Admin username already exists.");
      process.exit(0);
    }

    await db.query(
      `INSERT INTO admins
       (full_name, username, password, role, active)
       VALUES (?, ?, ?, ?, ?)`,
      [fullName, username, hashedPassword, "super_admin", 1]
    );

    console.log("✅ Admin created successfully.");
    console.log(`Username: ${username}`);
    console.log("Password: stored securely from .env");
  } catch (error) {
    console.error("❌ Failed to create admin:", error.message);
  } finally {
    try {
      await db.end();
    } catch (error) {
      // Ignore database close errors
    }
  }
}

createAdmin();