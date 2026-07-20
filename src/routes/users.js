const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, saveDb } = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`);

    if (result.length === 0) return res.json([]);

    const users = result[0].values.map(row => ({
      id: row[0], name: row[1], email: row[2], role: row[3], created_at: row[4]
    }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const db = await getDb();

    const existing = db.exec(`SELECT id FROM users WHERE email = '${email}'`);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const userRole = role || 'employee';
    db.run(`INSERT INTO users (name, email, password, role) VALUES ('${name}', '${email}', '${hashedPassword}', '${userRole}')`);
    const result = db.exec(`SELECT last_insert_rowid()`);
    const id = result[0].values[0][0];
    saveDb();

    res.json({ id, name, email, role: userRole });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Нельзя удалить себя' });
    }
    db.run(`DELETE FROM users WHERE id = ${req.params.id}`);
    saveDb();
    res.json({ message: 'Удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
