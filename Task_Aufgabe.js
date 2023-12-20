/**
 * Author: Piera Blum
 * Date: 20.12.2023
 * ka
 */

const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;
const SECRET_KEY = "your-secret-key";

const authenticatedTokens = [];
const tokens = new Set();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger_output.json'); // Passe den Pfad zur generierten JSON-Datei an

app.use(bodyParser.json());
// Middleware zur Überprüfung des Tokens bei allen Endpunkten (außer /login)
app.use((req, res, next) => {
  if (req.path === "/login") {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized - Bearer Token not provided" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ error: "Unauthorized - Invalid token format" });
  }
  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
});
let tasks = [
  {
    id: 1,
    title: "Hausaufgaben machen",
    description: "Mathematik und Chemie lernen",
  },
  {
    id: 2,
    title: "Zimmer aufräumen",
    description: "Zimmer aufräumen und putzen",
  },
  {
    id: 3,
    title: "Freunde Treffen und Töff fahren",
    description: "Meinen Kopf frei bekommen und Zeit mit Freunden genießen",
  },
];

// Middleware für Fehlerbehandlung
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Authentifizierung Middleware
function authenticateUser(req, res, next) {
  const token = req.headers.authorization;

  if (!token || !authenticatedTokens.includes(token)) {
    return res
      .status(403)
      .json({ error: "Forbidden: Invalid or missing token" });
  }

  next();
}

// POST /login Endpunkt - Credentials überprüfen und Token zurückgeben
app.post("/login", (req, res) => {
  const { mail, password } = req.body;
  if (mail === "pieramblum@gmail.com" && password === "piera") {
    const token = jwt.sign({ mail }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// DELETE /logout Endpunkt - Token als ungültig markieren
app.delete("/logout", (req, res) => {
  const token = req.headers.authorization;
  if (token && tokens.has(token)) {
    tokens.delete(token);
    res.json({ message: "Logout successful" });
  } else {
    res.status(400).json({ error: "Invalid token or already logged out" });
  }
});

// GET /verify Endpunkt - Token auf Gültigkeit überprüfen
app.get("/verify", (req, res) => {
  res.json({ message: "Token is valid" });
});

// GET /tasks Endpunkt
// GET /tasks Endpunkt - Alle Tasks abrufen
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// POST /tasks Endpunkt - Neuen Task erstellen
app.post("/tasks", (req, res) => {
  const newTask = req.body;
  // Validierung der eingehenden Daten
  if (!newTask || !newTask.title || !newTask.description) {
    return res
      .status(400)
      .json({ error: "Invalid data - Title and description are required" });
  }
  newTask.id = tasks.length + 1;
  tasks.push(newTask);
  res.json(newTask);
});

// GET /tasks/{id} Endpunkt - Einen einzelnen Task abrufen
app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  console.log("Requested task ID:", taskId);
  console.log("Tasks array:", tasks);
  const task = tasks.find((t) => t.id === taskId);
  console.log("Found task:", task);
  if (task) {
    res.status(200).json(task);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// PUT /tasks/{id} Endpunkt - Einen bestehenden Task verändern
app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const updatedTask = req.body;
    // Validierung der eingehenden Daten
    if (!updatedTask || !updatedTask.title || !updatedTask.description) {
        return res.status(400).json({ error: 'Invalid data - Title and description are required' });
    }
    tasks = tasks.map((task) => (task.id === taskId ? { ...task, ...updatedTask } : task));
    res.json({ id: taskId, ...updatedTask });
});

// DELETE /tasks/{id} Endpunkt - Einen Task löschen
app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  tasks = tasks.filter((task) => task.id !== taskId);
  res.json({ message: "Task deleted successfully" });
});

// Verwenden von Swagger UI Middleware
app.use('/swagger-ui/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
