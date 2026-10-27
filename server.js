
const express = require("express");

const app = express();
app.use(express.json());

// Middleware: log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

let users = [];
let nextId = 1;

// GET: Get all users
app.get("/users", (req, res) => {
  res.json(users);
});

// GET: Get a user by ID
app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

// POST: Create a new user
app.post("/users", (req, res) => {
  const { name, email } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).json({
      error: "A valid name and email are required"
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ error: "Email already exists" });
  }

  const user = {
    id: nextId++,
    name: name.trim(),
    email: email.trim()
  };

  users.push(user);
  res.status(201).json(user);
});

// PUT: Update an existing user
app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { name, email } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).json({
      error: "A valid name and email are required"
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (users.some(
    u => u.id !== id && u.email.toLowerCase() === normalizedEmail
  )) {
    return res.status(409).json({ error: "Email already exists" });
  }

  user.name = name.trim();
  user.email = email.trim();

  res.json(user);
});

// DELETE: Delete a user
app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users.splice(index, 1);
  res.status(204).send();
});

// Handle invalid JSON and other errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Start the server
app.listen(3000, () => {
  console.log("User API running at http://localhost:3000");
});
