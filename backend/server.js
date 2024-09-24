const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;
const COUNTRIES_API_BASE_URL =
  process.env.COUNTRIES_API_BASE_URL || "https://restcountries.com/v3.1";

app.use(cors());
app.use(express.json());

// Add this middleware for logging all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: 5432,
  // connectionString: process.env.DATABASE_URL,
});

// Create the 'destinations' table if it doesn't exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS destinations (
  id SERIAL PRIMARY KEY,
  country VARCHAR(100) NOT NULL,
  capital VARCHAR(100),
  population INTEGER,
  region VARCHAR(100)
);`;

// Ensure the table exists when the server starts
pool
  .query(createTableQuery)
  .then(() => console.log("Destinations table is ready"))
  .catch((err) => console.error("Error creating destinations table:", err));

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

app.get("/api/destinations", async (req, res) => {
  console.log("GET /api/destinations - Fetching all destinations");
  try {
    const result = await pool.query(
      "SELECT * FROM destinations ORDER BY id DESC"
    );
    console.log(
      `GET /api/destinations - Fetched ${result.rows.length} destinations`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/destinations - Error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

app.post("/api/destinations", async (req, res) => {
  console.log("POST /api/destinations - Adding new destination");
  const { country } = req.body;
  try {
    console.log(
      `POST /api/destinations - Fetching data for country: ${country}`
    );
    const response = await axios.get(
      `${COUNTRIES_API_BASE_URL}/name/${country}`
    );
    const countryInfo = response.data[0];

    const result = await pool.query(
      "INSERT INTO destinations (country, capital, population, region) VALUES ($1, $2, $3, $4) RETURNING *",
      [
        country,
        countryInfo.capital[0],
        countryInfo.population,
        countryInfo.region,
      ]
    );
    console.log(
      `POST /api/destinations - Added new destination: ${JSON.stringify(
        result.rows[0]
      )}`
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/destinations - Error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

app.delete("/api/destinations/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`DELETE /api/destinations/${id} - Deleting destination`);
  try {
    await pool.query("DELETE FROM destinations WHERE id = $1", [id]);
    console.log(`DELETE /api/destinations/${id} - Destination deleted`);
    res.status(204).send();
  } catch (err) {
    console.error(`DELETE /api/destinations/${id} - Error:`, err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

app.get("/", async (req, res) => {
  res.status(200).send("Server is working");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Database host: ${process.env.DATABASE_URL}`);
  console.log(`Database name: ${process.env.DB_NAME}`);
  console.log(`Countries API base URL: ${COUNTRIES_API_BASE_URL}`);
  console.log(`POSTGRES_PASSWORD name: ${process.env.POSTGRES_PASSWORD}`);
});
