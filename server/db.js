const { Pool } = require("pg");
require("dotenv/config");

// Railway provides DATABASE_URL automatically. For local dev, use individual vars or DATABASE_URL
const pool = new Pool(
   process.env.DATABASE_URL
      ? {
           connectionString: process.env.DATABASE_URL,
           // Railway always requires SSL - use it when DATABASE_URL is present (Railway) or in production
           ssl: process.env.NODE_ENV === "production" || process.env.DATABASE_URL.includes("railway.app") 
              ? { rejectUnauthorized: false } 
              : false,
        }
      : {
           user: process.env.DB_USER,
           host: process.env.DB_HOST,
           database: process.env.DB_NAME,
           password: process.env.DB_PASSWORD,
           port: process.env.DB_PORT,
        }
);

pool
   .query("SELECT 1")
   .then(() => console.log("DB connected"))
   .catch((err) =>
      console.error("DB connection failed", err)
   );

module.exports = pool;
