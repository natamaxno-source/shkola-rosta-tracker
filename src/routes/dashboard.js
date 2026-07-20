const express = require('express');
const { getDb } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const db = await getDb();

    const tasksByStatus = db.exec(`
      SELECT status, COUNT(*) as count FROM tasks
      ${req.user.role === 'employee' ? `WHERE assigned_to = ${req.user.id}` : ''}
      GROUP BY status
    `);

    const stats = { new: 0, in_progress: 0, review: 0, done: 0 };
    if (tasksByStatus.length > 0) {
      tasksByStatus[0].values.forEach(row => {
        stats[row[0]] = row[1];
      });
    }

    const totalTasks = Object.values(stats).reduce((a, b) => a + b, 0);

    const upcoming = db.exec(`
      SELECT t.id, t.title, t.deadline, t.status, t.priority, u.name as assignee_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.deadline IS NOT NULL
      ${req.user.role === 'employee' ? `AND t.assigned_to = ${req.user.id}` : ''}
      ORDER BY t.deadline ASC
      LIMIT 5
    `);

    let upcomingTasks = [];
    if (upcoming.length > 0) {
      upcomingTasks = upcoming[0].values.map(row => ({
        id: row[0], title: row[1], deadline: row[2], status: row[3],
        priority: row[4], assignee_name: row[5]
      }));
    }

    const recent = db.exec(`
      SELECT t.id, t.title, t.status, t.created_at
      FROM tasks t
      ${req.user.role === 'employee' ? `WHERE t.assigned_to = ${req.user.id}` : ''}
      ORDER BY t.created_at DESC
      LIMIT 5
    `);

    let recentTasks = [];
    if (recent.length > 0) {
      recentTasks = recent[0].values.map(row => ({
        id: row[0], title: row[1], status: row[2], created_at: row[3]
      }));
    }

    const projectCount = db.exec(`SELECT COUNT(*) FROM projects`);
    const studentCount = db.exec(`SELECT COUNT(*) FROM students`);
    const userCount = db.exec(`SELECT COUNT(*) FROM users`);

    res.json({
      stats,
      totalTasks,
      upcomingTasks,
      recentTasks,
      projectCount: projectCount[0]?.values[0][0] || 0,
      studentCount: studentCount[0]?.values[0][0] || 0,
      userCount: userCount[0]?.values[0][0] || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
