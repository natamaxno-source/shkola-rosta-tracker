const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const db = await getDb();

    const existing = db.exec(`SELECT id FROM users WHERE email = '${email}'`);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (name, email, password, role) VALUES ('${name}', '${email}', '${hashedPassword}', 'admin')`);

    const user = db.exec(`SELECT id, name, email, role FROM users WHERE email = '${email}'`);
    const token = jwt.sign(
      { id: user[0].values[0][0], email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user[0].values[0][0], name, email, role: 'admin' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getDb();

    const result = db.exec(`SELECT id, name, email, password, role FROM users WHERE email = '${email}'`);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const [id, name, userEmail, hashedPassword, role] = result[0].values[0];
    const valid = await bcrypt.compare(password, hashedPassword);
    if (!valid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ id, email: userEmail, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, name, email: userEmail, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`SELECT id, name, email, role, avatar FROM users WHERE id = ${req.user.id}`);
    if (result.length === 0) return res.status(404).json({ error: 'Не найден' });

    const [id, name, email, role, avatar] = result[0].values[0];
    res.json({ id, name, email, role, avatar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const db = await getDb();

    if (name) db.run(`UPDATE users SET name = '${name}' WHERE id = ${req.user.id}`);
    if (email) db.run(`UPDATE users SET email = '${email}' WHERE id = ${req.user.id}`);
    if (avatar !== undefined) db.run(`UPDATE users SET avatar = '${avatar}' WHERE id = ${req.user.id}`);

    const result = db.exec(`SELECT id, name, email, role, avatar FROM users WHERE id = ${req.user.id}`);
    const [id, uName, uEmail, uRole, uAvatar] = result[0].values[0];
    res.json({ id, name: uName, email: uEmail, role: uRole, avatar: uAvatar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const db = await getDb();

    const result = db.exec(`SELECT password FROM users WHERE id = ${req.user.id}`);
    const hashedPassword = result[0].values[0][0];
    const valid = await bcrypt.compare(oldPassword, hashedPassword);
    if (!valid) return res.status(400).json({ error: 'Неверный текущий пароль' });

    const newHashed = await bcrypt.hash(newPassword, 10);
    db.run(`UPDATE users SET password = '${newHashed}' WHERE id = ${req.user.id}`);
    res.json({ message: 'Пароль обновлён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
