const mongoose = require('../../database');


const TaskSchema = mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    //Each task is related to one project
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        require: true,
    },
    //Each task will be assigned to an user
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    }, 
    completed: {
        type: Boolean,
        require: true,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }

});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;