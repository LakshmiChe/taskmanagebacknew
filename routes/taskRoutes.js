const express = require('express');
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

router.post('/:id/comments', authMiddleware, addComment);
router.post('/:id/attachments', authMiddleware, attachFile);
router.post('/:id/getTaskReport', authMiddleware, getTaskReport);
router.post('/:id/notifyDeadlines', authMiddleware, notifyDeadlines);
module.exports = router;
