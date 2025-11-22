// Main Express server for DecaDrive backend
// - Loads environment variables
// - Connects to MongoDB using config/mongo.js
// - Configures CORS, JSON parsing, routes, and error handling

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectToDatabase, getDb, getClient } = require("./config/mongo");

const lessonsRouter = require("./routes/lessons");
const ordersRouter = require("./routes/orders");

const PORT = process.env.PORT || 8080;

const app = express();

// CORS: allow only configured frontend origin
app.use(cors({}));

// Parse JSON bodies
app.use(express.json());

// Routes
app.use("/lessons", lessonsRouter);
app.use("/orders", ordersRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// 404 handler for unknown endpoints
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server after DB connection
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`DecaDrive backend listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database", err);
    process.exit(1);
  });
