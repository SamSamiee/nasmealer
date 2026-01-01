// Database initialization script
// Run this once after deploying to set up all tables
// Usage: node init-db.js

const { Pool } = require("pg");
require("dotenv/config");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function initDatabase() {
  try {
    console.log("Connecting to database...");
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, "database.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    
    // Split by semicolons and filter out empty statements and CREATE DATABASE
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter(
        (s) =>
          s.length > 0 &&
          !s.startsWith("--") &&
          !s.toUpperCase().startsWith("CREATE DATABASE")
      );
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log("✓ Executed statement");
        } catch (err) {
          // Ignore "already exists" errors for idempotency
          if (
            err.message.includes("already exists") ||
            err.code === "42P07" || // duplicate_table
            err.code === "42710" || // duplicate_object
            err.code === "42P16" // duplicate_alias
          ) {
            console.log("⚠ Already exists, skipping...");
          } else {
            console.error("✗ Error executing statement:", err.message);
            // Don't throw for CREATE DATABASE errors (expected on Render)
            if (!statement.toUpperCase().includes("CREATE DATABASE")) {
              throw err;
            }
          }
        }
      }
    }
    
    console.log("\n✅ Database initialized successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
    process.exit(1);
  }
}

initDatabase();

