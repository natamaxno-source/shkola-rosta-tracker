const express = require('express');
const { getDb, saveDb } = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`SELECT id, name, email, courses, created_at FROM students ORDER BY created_at DESC`);

    if (result.length === 0) return res.json([]);

    const students = result[0].values.map(row => ({
      id: row[0], name: row[1], email: row[2], courses: row[3], created_at: row[4]
    }));
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`SELECT id, name, email, courses, created_at FROM students WHERE id = ${req.params.id}`);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Ученик не найден' });
    }

    const row = result[0].values[0];
    res.json({ id: row[0], name: row[1], email: row[2], courses: row[3], created_at: row[4] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, email, courses } = req.body;
    const db = await getDb();

    db.run(`INSERT INTO students (name, email, courses) VALUES ('${name}', '${email || ''}', '${courses || ''}')`);
    const result = db.exec(`SELECT last_insert_rowid()`);
    const id = result[0].values[0][0];
    saveDb();

    res.json({ id, name, email, courses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, courses } = req.body;
    const db = await getDb();

    if (name) db.run(`UPDATE students SET name = '${name}' WHERE id = ${req.params.id}`);
    if (email !== undefined) db.run(`UPDATE students SET email = '${email}' WHERE id = ${req.params.id}`);
    if (courses !== undefined) db.run(`UPDATE students SET courses = '${courses}' WHERE id = ${req.params.id}`);

    saveDb();
    res.json({ message: 'Обновлено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    db.run(`DELETE FROM students WHERE id = ${req.params.id}`);
    saveDb();
    res.json({ message: 'Удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
