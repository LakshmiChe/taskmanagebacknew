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
    .put(authMiddleware, updateTask)
    .delete(authMiddleware, deleteTask);


// Update Task Route
// Add this route in your routes.js file
router.post('/:id/notify', authMiddleware, async (req, res) => {
    try {
        const { email, taskTitle, message } = req.body;

        // Call the notifyTaskUpdate service with required parameters
        await notifyTaskUpdate({ email, taskTitle, message });

        res.status(200).json({ message: "Notification sent successfully" });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ message: "Failed to send notification" });
    }
});


router.post('/:id/comments', authMiddleware, addComment);
router.post('/:id/attachments', authMiddleware, attachFile);
router.post('/:id/getTaskReport', authMiddleware, getTaskReport);
router.post('/:id/notifyDeadlines', authMiddleware, notifyDeadlines);
module.exports = router;
