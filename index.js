const express = require("express");
const dotenv = require("dotenv");
const hourly = require("./app/hourly");

const checkAuthorization = require("./app/middleware");

dotenv.config();

const app = express();

const port = process.env.RUNNING_PORT || 8000;

app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/api/hourlytweet", checkAuthorization, (req, res) => {
  hourly();

  res.json({ success: "tweet sent" });
});

app.use((err, res) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
