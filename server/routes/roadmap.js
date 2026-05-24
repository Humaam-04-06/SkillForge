const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Roadmap = require('../models/Roadmap');

// GET /api/roadmap/active
router.get('/active', requireAuth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user._id, isActive: true })
      .populate('skillGapId');
    
    if (!roadmap) {
      return res.status(404).json({ message: 'No active roadmap found.' });
    }

    res.json(roadmap);
  } catch (error) {
    console.error('Error fetching active roadmap:', error);
    res.status(500).json({ message: 'Failed to fetch active roadmap.' });
  }
});

// PATCH /api/roadmap/complete-task
// Request body: { weekNumber, dayNumber, completed }
router.patch('/complete-task', requireAuth, async (req, res) => {
  try {
    const { weekNumber, dayNumber, completed } = req.body;
    if (weekNumber === undefined || dayNumber === undefined || completed === undefined) {
      return res.status(400).json({ message: 'weekNumber, dayNumber, and completed (boolean) are required.' });
    }

    const roadmap = await Roadmap.findOne({ userId: req.user._id, isActive: true });
    if (!roadmap) {
      return res.status(404).json({ message: 'No active roadmap found.' });
    }

    // Find the week and day inside the weeks array
    const week = roadmap.weeks.find(w => w.weekNumber === weekNumber);
    if (!week) {
      return res.status(400).json({ message: `Week ${weekNumber} not found in roadmap.` });
    }

    const day = week.days.find(d => d.day === dayNumber);
    if (!day) {
      return res.status(400).json({ message: `Day ${dayNumber} not found in week ${weekNumber}.` });
    }

    day.completed = completed;
    day.completedAt = completed ? new Date() : null;

    // Recalculate overall progress
    let totalDays = 0;
    let completedDays = 0;

    roadmap.weeks.forEach(w => {
      w.days.forEach(d => {
        totalDays++;
        if (d.completed) completedDays++;
      });
    });

    roadmap.progress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    await roadmap.save();

    res.json({
      message: 'Task progress updated.',
      roadmap
    });

  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: 'Failed to update task progress.' });
  }
});

// GET /api/roadmap/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found.' });
    }
    res.json(roadmap);
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ message: 'Failed to fetch roadmap.' });
  }
});

module.exports = router;
