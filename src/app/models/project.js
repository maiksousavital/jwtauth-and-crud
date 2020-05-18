const mongoose = require('../../database');


const ProjectSchema = mongoose.Schema({

    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    //A project is created by an user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    //A project may have a list os tasks
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project; 