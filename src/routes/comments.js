const express = require('express');
const { getDb, saveDb } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/:taskId', auth, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT c.id, c.text, c.created_at, c.user_id, u.name as user_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ${req.params.taskId}
      ORDER BY c.created_at ASC
    `);

    if (result.length === 0) return res.json([]);

    const comments = result[0].values.map(row => ({
      id: row[0], text: row[1], created_at: row[2], user_id: row[3], user_name: row[4]
    }));
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:taskId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const db = await getDb();

    db.run(`INSERT INTO comments (task_id, user_id, text) VALUES (${req.params.taskId}, ${req.user.id}, '${text}')`);
    const result = db.exec(`SELECT last_insert_rowid()`);
    const id = result[0].values[0][0];
    saveDb();

    const comment = db.exec(`
      SELECT c.id, c.text, c.created_at, u.name as user_name
      FROM comments c LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ${id}
    `);

    const row = comment[0].values[0];
    res.json({ id: row[0], text: row[1], created_at: row[2], user_name: row[3], user_id: req.user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    db.run(`DELETE FROM comments WHERE id = ${req.params.id} AND user_id = ${req.user.id}`);
    saveDb();
    res.json({ message: 'Удалено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
