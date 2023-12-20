/**
 * Autor: Piera Blum
 * Datum: 20.12.2023
 * Das Programm ist eine einfache Task-Verwaltungsanwendung mit Authentifizierung.
 */

const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger_output.json");

const app = express();
const port = 3000;

const SECRET_KEY = "piera";
// Middleware zur Verarbeitung von JSON-Daten
app.use(bodyParser.json());
// Middleware zur Überprüfung des Tokens bei allen Endpunkten (ausser /login und /swagger-ui/)
app.use((req, res, next) => {
  // Pfad /swagger-ui/ ausschliessen
  if (req.path.startsWith("/swagger-ui/")) {
    return next();
  }
  // Pfad /login ausschliessen
  if (req.path === "/login") {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ error: "Unberechtigt - Bearer Token nicht angegeben" });
  } else {
    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Unberechtigt - Ungültiges Token-Format" });
    } else {
      try {
        jwt.verify(token, SECRET_KEY);
        next();
      } catch (error) {
        res.status(401).json({ error: "Unberechtigt - Ungültiges Token" });
      }
    }
  }
});

// Beispiel-Daten für Tasks
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
    title: "Freunde treffen und Töff fahren",
    description: "Meinen Kopf frei bekommen und Zeit mit Freunden geniessen",
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
    res
      .status(400)
      .json({
        error: "Ungültige Daten - Titel und Beschreibung sind erforderlich",
      });
  } else {
    newTask.id = tasks.length + 1;
    tasks.push(newTask);
    res.json(newTask);
  }
});

// GET /tasks/{id} Endpunkt - Einen einzelnen Task abrufen
app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === taskId);

  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ error: "Task nicht gefunden" });
  }
});

// PUT /tasks/{id} Endpunkt - Einen bestehenden Task verändern
app.put("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const updatedTask = req.body;

  // Validierung der eingehenden Daten
  if (!updatedTask || !updatedTask.title || !updatedTask.description) {
    res
      .status(400)
      .json({
        error: "Ungültige Daten - Titel und Beschreibung sind erforderlich",
      });
  } else {
    tasks = tasks.map((task) =>
      task.id === taskId ? { ...task, ...updatedTask } : task
    );
    res.json({ id: taskId, ...updatedTask });
  }
});

// DELETE /tasks/{id} Endpunkt - Einen Task löschen
app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  tasks = tasks.filter((task) => task.id !== taskId);
  res.json({ message: "Task erfolgreich gelöscht" });
});

// POST /login Endpunkt - Credentials überprüfen und Token zurückgeben
app.post("/login", (req, res) => {
  const { mail, password } = req.body;

  if (mail === "pieramblum@gmail.com" && password === "piera") {
    const token = jwt.sign({ mail }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Ungültige Zugangsdaten" });
  }
});

// DELETE /logout Endpunkt - Token als ungültig markieren
app.delete("/logout", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  if (blacklist.has(token)) {
    // Token befindet sich bereits auf der Blacklist
    res.status(400).json({ error: "Ungültiges Token oder bereits ausgeloggt" });
  } else {
    try {
      // Verifiziere den Token erst, wenn er nicht auf der Blacklist steht
      jwt.verify(token, SECRET_KEY);
      // Füge den Token zur Blacklist hinzu
      blacklist.add(token);
      res.status(204).end(); // Antwort ohne Content mit Statuscode 204
    } catch (error) {
      // Fehler beim Verifizieren des Tokens
      res.status(401).json({ error: "Unberechtigt - Ungültiges Token" });
    }
  }
});

app.use("/swagger-ui/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// GET /verify Endpunkt - Token auf Gültigkeit überprüfen
app.get("/verify", (req, res) => {
  res.json({ message: "Token ist gültig" });
});

// Hier könnten Sie eine echte Datenbank oder eine fortgeschrittenere Logik integrieren
let tokens = new Set();
// Erstelle eine separate Blacklist
let blacklist = new Set();

// Middleware zur Überprüfung des Tokens bei allen Endpunkten (ausser /login)
app.use((req, res, next) => {
  // Pfad /swagger-ui/ ausschliessen
  if (req.path.startsWith("/swagger-ui/")) {
    return next();
  }
  // Pfad /login ausschliessen
  if (req.path === "/login") {
    return next();
  }

  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ error: "Unberechtigt - Token nicht angegeben" });
  } else if (blacklist.has(token)) {
    res.status(401).json({ error: "Unberechtigt - Token ist ungültig" });
  } else {
    try {
      jwt.verify(token, SECRET_KEY);
      next();
    } catch (error) {
      res.status(401).json({ error: "Unberechtigt - Ungültiges Token" });
    }
  }
});

// Server starten
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
