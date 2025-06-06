const Task = require('../models/Task');
const sendMail = require('../config/mailer');
const { sendEmail } = require("../services/emailService");

// Create a new task
const createTask = async (req, res) => {
    const { title, description, deadline, priority, assignedTo } = req.body;

    try {
        const task = await Task.create({
            title,
            description,
            deadline,
            priority,
            assignedTo,
            createdBy: req.user.id,
        });

        if (assignedTo) {
            // Notify assigned user
            sendMail(
                req.user.email, // Email of the task creator
                'Task Assigned',
                `A new task "${title}" has been assigned to you. Deadline: ${deadline}`
            );
        }

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all tasks
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.user.id }).populate('assignedTo', 'name email');
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a task
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, deadline, priority, status, assignedTo } = req.body;

    try {
        const task = await Task.findById(id).populate('assignedTo', 'email'); // Fetch assigned user's email

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        // Update task fields
        task.title = title || task.title;
        task.description = description || task.description;
        task.deadline = deadline || task.deadline;
        task.priority = priority || task.priority;
        task.status = status || task.status;
        task.assignedTo = assignedTo || task.assignedTo;

        const updatedTask = await task.save();

        // Notify assigned user about the update if the task has an assigned user
        if (task.assignedTo?.email) {
            const subject = `Task Update: ${updatedTask.title}`;
            const message = `
                Hello,

                The task "${updatedTask.title}" has been updated with the following details:

                - Description: ${updatedTask.description}
                - Deadline: ${updatedTask.deadline}
                - Priority: ${updatedTask.priority}
                - Status: ${updatedTask.status}

                Please review the changes.

                Best regards,
                Task Management App
            `;

            await sendEmail(task.assignedTo.email, subject, message);
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: error.message });
    }
};

// const notifyTaskUpdate = async (task, userEmail) => {
//   const subject = `Task Update: ${task.title}`;
//   const text = `
//     Hello,

//     The task "${task.title}" has been updated.
//     Current Status: ${task.status}
//     Deadline: ${task.deadline}

//     Best regards,
//     Task Management App
//   `;
//   await sendEmail(userEmail, subject, text);
// };
// Delete a task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!task.createdBy || task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};
// Add a comment to a task
const addComment = async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    try {
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const comment = {
            user: req.user.id,
            text,
        };

        task.comments.push(comment);

        await task.save();

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Attach a file to a task
const attachFile = async (req, res) => {
    const { id } = req.params;
    const { filePath } = req.body;

    try {
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to modify this task' });
        }

        task.attachments.push(filePath);

        await task.save();

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get task progress and reports
const getTaskReport = async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.user.id });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'Completed').length;
        const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
        const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;

        const report = {
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
        };

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Notify about approaching deadlines
const notifyDeadlines = async (req, res) => {
    try {
        const tasks = await Task.find({
            createdBy: req.user.id,
            deadline: { $lte: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) },
        });

        tasks.forEach(task => {
            sendMail(
                req.user.email,
                'Task Deadline Approaching',
                `The task "${task.title}" has a deadline approaching: ${task.deadline}`
            );
        });

        res.status(200).json({ message: 'Notifications sent for approaching deadlines' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    addComment,
    attachFile,
    getTaskReport,
    notifyDeadlines
};
