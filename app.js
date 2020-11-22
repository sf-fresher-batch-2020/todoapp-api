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
//users
app.post('/api/users', createUser);
app.get('/api/users', getAllUsers);
app.post('/api/users/login', login);
// profiles
app.post('/api/profiles', createProfile);
app.get('/api/profiles', getProfile);
//tasks
app.post('/api/tasks', createTask);
app.get('/api/tasks', getTasks);
app.post('/api/tasks/update', updateTask);
// Functions
async function createUser(req, res) {
    let user = req.body;
    let params = [user.name, user.email, user.password];
    const result = await pool.query("INSERT INTO users (name,email,password) VALUES (?,?,?)", params);
    res.status(201).json({ id: result[0].insertId });
}

async function getAllUsers(req, res) {
    const result = await pool.query("SELECT * FROM users");
    res.status(200).json(result[0]);
}

async function login(req, res) {
    const user = req.body;
    let params = [user.email];
    console.log(params);
    const result = await pool.query("SELECT id, name, email, password FROM users WHERE email = ?", params);
    res.status(201).json(result[0]);
}

async function createProfile(req, res) {
    const user = req.body;
    let params = [user.userId, user.company];
    const result = await pool.query("INSERT INTO profiles (user_id, company) VALUES (?,?)", params);
    res.status(201).json({ id: result[0].insertId });
}

async function getProfile(req, res) {
    const user = req.body;
    let params = [user.uid];
    const result = await pool.query("SELECT * FROM profiles where user_id = ?", params);
    res.status(200).json(result[0]);
}

async function createTask(req, res) {
    const task = req.body;
    let params = [task.task, task.createdBy, task.priority, task.status];
    const result = await pool.query("INSERT INTO tasks (description, created_by, priority, status) VALUES (?,?,?,?)", params);
    res.status(201).json({ id: result[0].insertId });
}

async function getTasks(req, res) {
    const user = req.body;
    let params = [user.id];
    res.send({ message: req.body });
    // const result = await pool.query("SELECT * FROM tasks WHERE created_by = ?", params);
    // res.status(200).json(result[0]);
}

async function updateTask(req, res) {
    const task = req.body;
    let params = [task.task, task.priority, task.status, task.id];
    const result = await pool.query("UPDATE tasks SET description = ?, priority = ?, status = ? WHERE id = ?", params);
    res.status(201).json(result[0].info);
}

app.get("/", (req, res) => res.send({ message: "REST API Service is working" }));

app.listen(port, () => console.log(`Example app listening on port!`, port));