import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const env = process.env;
const log = console.log;
const app = express();

const db = mysql.createConnection({
    host: env.SQL_HOST,
    user: env.SQL_USERNAME,
    password: env.SQL_PASSWORD,
    database: env.SQL_NAME,
    // path: env.SQL_PATH
});

db.connect((err) => {
    err && log(err);
    if (err) return;

    log('Database connected!');
});

app.use(cors());
app.use(express.json());

app.get('/create-table', async (req, res) => {
    const sql = `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        birthDay VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    )`;

    db.query(sql, (err, result) => {
        err && log('Error GET /create-table', err);
        err && res.json({ message: 'Error creating table!' });

        res.json({ message: 'Table successful created!' });
    });
});

app.post('/users', async (req, res) => {
    try {
        log(req.body);
        const { firstName, lastName, birthDay, email, password } = req.body;
    
        const sql = `INSERT INTO users (firstName, lastName,
        birthDay, email, password ) VALUES (?, ?, ?, ?, ?)`;
    
        db.query(sql, [firstName, lastName, birthDay, email, password], (err, result) => {
            err && log('Error POST /users', err);
            if (err) return res.json({ message: 'Error inserting into users!' });
    
            log(result);
            res.json({ message: 'User successful saved!' });
        });

    } catch (err) {
        log('Error POST /users', err);
        res.json({ message: 'Something went wrong!' });
        return;
    }

});

app.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const sql = `SELECT * FROM users WHERE email = ?`;

        db.query(sql, [email], (err, result) => {
            err && log(err);
            if (err) return res.json({ message: 'Error checking user email!' });

            if (result.length === 0) return res.json({ message: 'Email not found!' });

            const user = result[0];
            log(user.password);

            if (password !== user.password)
                return res.json({ message: 'Password incorrect!' });

            user.password = undefined;
            log(user);

            res.json({ message: 'Email and password are correct!', user });
            return;
        });

    } catch (err) {
        log('Error GET /users');
        res.json({ message: 'Something went wrong!' });
        return;
    }
});

const PORT = 3000;
app.listen(PORT, () => (
    console.clear(), log(`Server started on http://localhost:${PORT}`)));