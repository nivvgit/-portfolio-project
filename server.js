const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const port = Number(process.env.PORT) || 3000;
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "nived",
    password: process.env.DB_PASSWORD || "tiger",
    database: process.env.DB_NAME || "railway",
    port: Number(process.env.DB_PORT) || 3306
};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const db = mysql.createConnection(dbConfig);
let isDbConnected = false;

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }

    isDbConnected = true;
    console.log("Database Connected!");
});

app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send("Name, email, and message are required.");
    }

    if (!isDbConnected) {
        return res.status(503).send("Database is unavailable. Set DB environment variables and try again.");
    }

    const sql = "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)";
    db.query(sql, [name, email, message], (err, result) => {
        if (err) {
            console.error("Insert failed:", err.message);
            return res.status(500).send("Failed to save your message.");
        }

        res.send("Data saved!");
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
