const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors');
const TOKEN_SECRET = "7bc78545b1a3923cc1e1e19523fd5c3f20b409509";
const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000


const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_URL || "localhost",
    port: 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "todoapp_db",
    connectionLimit: 1
});

// Routes
app.post('/api/users', createUser);

// Functions
async function createUser(req, res) {
    let user = req.body;
    let params = [user.name, user.email, user.password];
    const result = await pool.query("insert into users (name,email,password) values (?,?,?)", params);
    res.status(201).json({ id: result[0].insertId });
}

app.get("/", (req, res) => res.send({ message: "REST API Service is working" }));

app.listen(port, () => console.log(`Example app listening on port!`, port));