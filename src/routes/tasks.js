const express = require('express');
const { getDb, saveDb } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const db = await getDb();
    const { status, assigned_to, project_id } = req.query;

    let where = [];
    if (req.user.role === 'employee') {
      where.push(`t.assigned_to = ${req.user.id}`);
    }
    if (status) where.push(`t.status = '${status}'`);
    if (assigned_to) where.push(`t.assigned_to = ${assigned_to}`);
    if (project_id) where.push(`t.project_id = ${project_id}`);

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const result = db.exec(`
      SELECT t.id, t.title, t.description, t.status, t.priority, t.deadline,
             t.project_id, t.assigned_to, t.created_by, t.student_id, t.created_at,
             u1.name as assignee_name, u2.name as creator_name,
             p.name as project_name, s.name as student_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN students s ON t.student_id = s.id
      ${whereClause}
      ORDER BY t.created_at DESC
    `);

    if (result.length === 0) return res.json([]);

    const tasks = result[0].values.map(row => ({
      id: row[0], title: row[1], description: row[2], status: row[3],
      priority: row[4], deadline: row[5], project_id: row[6],
      assigned_to: row[7], created_by: row[8], student_id: row[9],
      created_at: row[10], assignee_name: row[11], creator_name: row[12],
      project_name: row[13], student_name: row[14]
    }));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT t.id, t.title, t.description, t.status, t.priority, t.deadline,
             t.project_id, t.assigned_to, t.created_by, t.student_id, t.created_at,
             u1.name as assignee_name, u2.name as creator_name,
             p.name as project_name, s.name as student_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN students s ON t.student_id = s.id
      WHERE t.id = ${req.params.id}
    `);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    const row = result[0].values[0];
    res.json({
      id: row[0], title: row[1], description: row[2], status: row[3],
      priority: row[4], deadline: row[5], project_id: row[6],
      assigned_to: row[7], created_by: row[8], student_id: row[9],
      created_at: row[10], assignee_name: row[11], creator_name: row[12],
      project_name: row[13], student_name: row[14]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, priority, project_id, assigned_to, deadline, student_id } = req.body;
    const db = await getDb();

    const assignedVal = assigned_to || 'NULL';
    const projectVal = project_id || 'NULL';
    const studentVal = student_id || 'NULL';
    const deadlineVal = deadline ? `'${deadline}'` : 'NULL';

    db.run(`INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, created_by, deadline, student_id)
      VALUES ('${title}', '${description || ''}', '${status || 'new'}', '${priority || 'medium'}',
              ${projectVal}, ${assignedVal}, ${req.user.id}, ${deadlineVal}, ${studentVal})`);

    const result = db.exec(`SELECT last_insert_rowid()`);
    const id = result[0].values[0][0];
    saveDb();

    const task = db.exec(`SELECT * FROM tasks WHERE id = ${id}`);
    res.json({ id: task[0].values[0][0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, priority, assigned_to, deadline, student_id } = req.body;
    const db = await getDb();

    if (title) db.run(`UPDATE tasks SET title = '${title}' WHERE id = ${req.params.id}`);
    if (description !== undefined) db.run(`UPDATE tasks SET description = '${description}' WHERE id = ${req.params.id}`);
    if (status) db.run(`UPDATE tasks SET status = '${status}' WHERE id = ${req.params.id}`);
    if (priority) db.run(`UPDATE tasks SET priority = '${priority}' WHERE id = ${req.params.id}`);
    if (assigned_to !== undefined) {
      const val = assigned_to || 'NULL';
      db.run(`UPDATE tasks SET assigned_to = ${val} WHERE id = ${req.params.id}`);
    }
    if (deadline !== undefined) {
      const val = deadline ? `'${deadline}'` : 'NULL';
      db.run(`UPDATE tasks SET deadline = ${val} WHERE id = ${req.params.id}`);
    }
    if (student_id !== undefined) {
      const val = student_id || 'NULL';
      db.run(`UPDATE tasks SET student_id = ${val} WHERE id = ${req.params.id}`);
    }

    saveDb();
    res.json({ message: 'Обновлено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    db.run(`DELETE FROM tasks WHERE id = ${req.params.id}`);
    saveDb();
    res.json({ message: 'Удалено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
