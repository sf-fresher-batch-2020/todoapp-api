const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const { JwtUtil } = require("./util/jwt.util");

const mysql = require("mysql2/promise");
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_ID || "yatranubhav.feedback@gmail.com",
        pass: process.env.MAIL_PASS || "Yatranubhav@123"
    }
});

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
app.get('/api/profiles/:id', getProfile);
app.post('/api/profiles/update', updateProfile);
//tasks
app.post('/api/tasks', createTask);
app.get('/api/tasks/:id', getTasks);
app.post('/api/tasks/update', updateTask);
app.post('/api/tasks/delete', deleteTask);
// Functions
async function createUser(req, res) {
    let user = req.body;
    let params = [user.name, user.email, user.password];
    const result = await pool.query("INSERT INTO users (name,email,password) VALUES (?,?,?)", params);
    if (result[0].length > 0) {
        var mailOptions = {
            from: 'yatranubhav.feedback@gmail.com',
            to: result[0].email,
            subject: 'Reg - ToDo App Signup',
            text: 'Thanks for Signing Up with our ToDo app...!'
        };
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log('email sent');
            }
        });
    }
    res.status(201).json({ id: result[0].insertId });
}

async function getAllUsers(req, res) {
    const result = await pool.query("SELECT * FROM users");
    res.status(200).json(result[0]);
}

async function login(req, res) {
    const user = req.body;
    let params = [user.email, user.password];
    const result = await pool.query("SELECT id, name, email FROM users WHERE email = ? AND password = ?", params);
    if (result[0].length == 0) {
        throw new Error("Invalid Login Credentials");
    }
    res.status(201).json(result[0]);
}

async function createProfile(req, res) {
    const user = req.body;
    let params = [user.userId, user.company];
    const result = await pool.query("INSERT INTO profiles (user_id, company) VALUES (?,?)", params);
    res.status(201).json({ id: result[0].insertId });
}

async function getProfile(req, res) {
    const id = req.params.id;
    const result = await pool.query("SELECT * FROM profiles where user_id = ?", id);
    res.status(200).json(result[0]);
}

async function updateProfile(req, res) {
    const profile = req.body;
    let params = [profile.company, profile.profileId];
    const result = await pool.query("UPDATE profiles SET company = ? WHERE id = ?", params);
    res.status(201).json(result[0].info);
}

async function createTask(req, res) {
    const task = req.body;
    let params = [task.task, task.createdBy, task.priority, task.status];
    const result = await pool.query("INSERT INTO tasks (description, created_by, priority, status) VALUES (?,?,?,?)", params);
    res.status(201).json({ id: result[0].insertId });
}

async function getTasks(req, res) {
    const uid = req.params.id;
    const result = await pool.query("SELECT * FROM tasks WHERE created_by = ?", uid);
    res.status(200).json(result[0]);
}

async function updateTask(req, res) {
    const task = req.body;
    let params = [task.task, task.priority, task.status, task.id];
    const result = await pool.query("UPDATE tasks SET description = ?, priority = ?, status = ? WHERE id = ?", params);
    res.status(201).json(result[0].info);
}

async function deleteTask(req, res) {
    const task = req.body;
    let params = [task.id];
    const result = await pool.query("DELETE FROM tasks WHERE id = ?", params);
    res.status(201).json(result[0].info);
}

app.listen(port, () => console.log(`Example app listening on port!`, port));