const express = require('express');
const { notifyTaskUpdate } = require("../services/emailService"); // Adjust path as needed

const {
    createTask,
    updateTask,
    deleteTask,
    getTasks,
    addComment,
    attachFile,
    getTaskReport,
    notifyDeadlines
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(authMiddleware, getTasks)
    .post(authMiddleware, createTask);

router.route('/:id')
    // .put(authMiddleware, updateTask)
    .delete(authMiddleware, deleteTask);


// Update Task Route
router.put("/:taskId", authMiddleware, async (req, res) => {
  try {
    const updatedTask = await updateTask(req.params.taskId, req.body);

    // Fetch the user's email (assuming you store user info in the request via authMiddleware)
    const userEmail = req.user.email;

    // Notify the user about the task update
    await notifyTaskUpdate(updatedTask, userEmail);

    res.status(200).json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
});

router.post('/:id/comments', authMiddleware, addComment);
router.post('/:id/attachments', authMiddleware, attachFile);
router.post('/:id/getTaskReport', authMiddleware, getTaskReport);
router.post('/:id/notifyDeadlines', authMiddleware, notifyDeadlines);
module.exports = router;
