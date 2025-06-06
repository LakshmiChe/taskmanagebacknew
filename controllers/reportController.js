const Task = require('../models/Task');


// Task Completion Report
// Task Completion Report
exports.getTaskCompletionReport = async (req, res) => {
  try {
    const completed = await Task.countDocuments({ status: 'completed' });
    const inProgress = await Task.countDocuments({ status: 'in-progress' });
    const pending = await Task.countDocuments({ status: 'pending' });

    res.json({ tasks: { completed, inProgress, pending } });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching report', error: err });
  }
};


// Upcoming Deadlines
exports.getUpcomingDeadlines = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const tasks = await Task.find({ deadline: { $gte: today, $lte: nextWeek } });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching deadlines', error: err });
  }
};

// Progress Report
exports.getProgressReport = async (req, res) => {
  try {
    const tasks = await Task.aggregate([
      {
        $group: {
          _id: { $week: '$createdAt' },
          completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          totalTasks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching progress', error: err });
  }
};
