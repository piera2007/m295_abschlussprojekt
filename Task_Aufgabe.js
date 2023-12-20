/**
 * Author: Piera Blum
 * Date: 20.12.2023
 * Programm
 */

const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const secretKey = "yourSecretKey"; // Geheimes Schlüssel für die Token-Signierung

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

app.use(bodyParser.json());

// Endpunkte
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/tasks", (req, res) => {
  const newTask = req.body;

  if (!newTask.title || !newTask.description) {
    res.status(422).json({ error: "Missing required attributes" });
  } else {
    tasks.push(newTask);
    res.status(201).json(newTask);
  }
});

app.get("/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const task = tasks.find((t) => t.id === taskId);

  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

app.put("/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const updatedTaskData = req.body;

  if (!updatedTaskData.title || !updatedTaskData.description) {
    res.status(422).json({ error: "Missing required attributes" });
  } else {
    const index = tasks.findIndex((t) => t.id === taskId);

    if (index !== -1) {
      tasks[index] = updatedTaskData;
      res.status(200).json(updatedTaskData);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  }
});

app.delete("/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const index = tasks.findIndex((t) => t.id === taskId);

  if (index !== -1) {
    const deletedTask = tasks.splice(index, 1);
    res.status(200).json(deletedTask[0]);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});