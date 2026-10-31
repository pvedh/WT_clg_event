const express = require("express");
const winston = require("winston");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// Create logs directory
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Configure Winston
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, "app.log")
        })
    ]
});

// Student data
let students = [
    { id: 1, name: "Pakala Vedh", rollNo: "23071A05B1", course: "Computer Science" },
    { id: 2, name: "Vedh", rollNo: "23071A05B1", course: "Information Technology" }
];

// Log every API request after its response finishes
app.use((req, res, next) => {
    res.on("finish", () => {
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`);
    });
    next();
});

// GET all students
app.get("/students", (req, res) => {
    res.json({ success: true, data: students });
});

// GET student by ID
app.get("/students/:id", (req, res) => {
    const student = students.find(s => s.id === Number(req.params.id));
    if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, data: student });
});

// POST new student
app.post("/students", (req, res) => {
    const newStudent = {
        id: students.length ? Math.max(...students.map(s => s.id)) + 1 : 1,
        ...req.body
    };
    students.push(newStudent);
    res.status(201).json({ success: true, data: newStudent });
});

// PATCH student
app.patch("/students/:id", (req, res) => {
    const student = students.find(s => s.id === Number(req.params.id));
    if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
    }
    Object.assign(student, req.body);
    res.json({ success: true, data: student });
});

// DELETE student
app.delete("/students/:id", (req, res) => {
    const index = students.findIndex(s => s.id === Number(req.params.id));
    if (index === -1) {
        return res.status(404).json({ success: false, message: "Student not found" });
    }
    students.splice(index, 1);
    res.json({ success: true, message: "Student deleted successfully" });
});

// Start server
app.listen(3000, () => {
    logger.info("Server is running at http://localhost:3000 for roll number 23071A05B1");
    console.log("Server is running at http://localhost:3000");
});