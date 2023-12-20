const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = 3000;
const SECRET_KEY = "your-secret-key";
// Middleware zur Verarbeitung von JSON-Daten
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
// Beispiel-Daten für Tasks
const tasks = [
  {
    id: "1",
    title: "Hausaufgaben machen",
    description: "Mathematik und Chemie lernen",
  },
  {
    id: "2",
    title: "Zimmer aufräumen",
    description: "Zimmer aufräumen und putzen",
  },
  {
    id: "3",
    title: "Freunde Treffen und Töff fahren",
    description: "Meinen Kopf frei bekommen und Zeit mit Freunden genießen",
  },
];
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
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});
// PUT /tasks/{id} Endpunkt - Einen bestehenden Task verändern
app.put("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const updatedTask = req.body;
  // Validierung der eingehenden Daten
  if (!updatedTask || !updatedTask.title || !updatedTask.description) {
    return res
      .status(400)
      .json({ error: "Invalid data - Title and description are required" });
  }
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, ...updatedTask } : task
  );
  res.json({ id: taskId, ...updatedTask });
});
// DELETE /tasks/{id} Endpunkt - Einen Task löschen
app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  tasks = tasks.filter((task) => task.id !== taskId);
  res.json({ message: "Task deleted successfully" });
});
// POST /login Endpunkt - Credentials überprüfen und Token zurückgeben
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "pieramblum@gmail.com" && password === "piera") {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});
// GET /verify Endpunkt - Token auf Gültigkeit überprüfen
app.get("/verify", (req, res) => {
  res.json({ message: "Token is valid" });
});
// Hier könnten Sie eine echte Datenbank oder eine fortgeschrittenere Logik integrieren
let tokens = new Set();
// Middleware zur Überprüfung des Tokens bei allen Endpunkten (außer /login)
app.use((req, res, next) => {
  if (req.path === "/login") {
    return next();
  }
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Token not provided" });
  }
  if (blacklist.has(token)) {
    return res.status(401).json({ error: "Unauthorized - Token is invalid" });
  }
  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
});
// Erstelle eine separate Blacklist
let blacklist = new Set();
// Middleware zur Überprüfung des Tokens bei allen Endpunkten (außer /login)
app.use((req, res, next) => {
  if (req.path === "/login") {
    return next();
  }
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Token not provided" });
  }
  if (blacklist.has(token)) {
    return res.status(401).json({ error: "Unauthorized - Token is invalid" });
  }
  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
});
// DELETE /logout Endpunkt - Token als ungültig markieren
app.delete("/logout", (req, res) => {
  const token = req.headers.authorization;
  if (blacklist.has(token)) {
    // Token befindet sich bereits auf der Blacklist
    res.status(400).json({ error: "Invalid token or already logged out" });
  } else {
    try {
      // Verifiziere den Token erst, wenn er nicht auf der Blacklist steht
      jwt.verify(token, SECRET_KEY);
      // Füge den Token zur Blacklist hinzu
      blacklist.add(token);
      res.status(204).end(); // Antwort ohne Content mit Statuscode 204
    } catch (error) {
      // Fehler beim Verifizieren des Tokens
      res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
  }
});
// Server starten
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
