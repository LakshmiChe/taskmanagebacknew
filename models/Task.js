const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    deadline: { type: Date },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            text: { type: String },
        },
    ],
    attachments: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
