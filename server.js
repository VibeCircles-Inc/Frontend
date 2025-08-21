const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Serve static files (CSS, JS, images, fonts) from "public"
app.use(express.static("public"));

// Default route → index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Custom routes (without .html extension)
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/404", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "404.html"));
});

// Catch-all for unknown routes → 404 page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Website running at http://localhost:${PORT}`);
});
