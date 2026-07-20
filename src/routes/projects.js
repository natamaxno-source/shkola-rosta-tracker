const express = require('express');
const { getDb } = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT p.id, p.name, p.description, p.created_at,
             u.name as creator_name,
             (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
    `);

    if (result.length === 0) return res.json([]);

    const projects = result[0].values.map(row => ({
      id: row[0], name: row[1], description: row[2],
      created_at: row[3], creator_name: row[4], task_count: row[5]
    }));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT p.id, p.name, p.description, p.created_at, u.name as creator_name
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = ${req.params.id}
    `);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Проект не найден' });
    }

    const row = result[0].values[0];
    res.json({ id: row[0], name: row[1], description: row[2], created_at: row[3], creator_name: row[4] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;
    const db = await getDb();
    db.run(`INSERT INTO projects (name, description, created_by) VALUES ('${name}', '${description || ''}', ${req.user.id})`);

    const result = db.exec(`SELECT last_insert_rowid()`);
    const id = result[0].values[0][0];
    const project = db.exec(`SELECT id, name, description, created_at FROM projects WHERE id = ${id}`);

    const row = project[0].values[0];
    res.json({ id: row[0], name: row[1], description: row[2], created_at: row[3] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;
    const db = await getDb();

    if (name) db.run(`UPDATE projects SET name = '${name}' WHERE id = ${req.params.id}`);
    if (description !== undefined) db.run(`UPDATE projects SET description = '${description}' WHERE id = ${req.params.id}`);

    const result = db.exec(`SELECT id, name, description, created_at FROM projects WHERE id = ${req.params.id}`);
    if (result.length === 0) return res.status(404).json({ error: 'Не найден' });

    const row = result[0].values[0];
    res.json({ id: row[0], name: row[1], description: row[2], created_at: row[3] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    db.run(`DELETE FROM projects WHERE id = ${req.params.id}`);
    res.json({ message: 'Удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
