const express = require('express');

const authMiddleware = require('../middleware/auth');


const Project = require('../models/project');
const Task = require('../models/task');

const router = express.Router();

//Use this middleware to validade if the token is correct
router.use(authMiddleware);

router.get('/', async (req, res) => {

    try{                                      // Eager Loading                                      
        const projects = await Project.find().populate(['user', 'tasks']);

        if(projects.length === 0)
        return res.status(400).send({ error: 'No projects to show'});

        return res.send({ projects });

    }catch(err){
        return res.status(400).send({error: 'Error loading projects'});
    }

});

router.get('/:projectId', async (req, res) =>{
   try{
    const project = await Project.findById(req.params.projectId).populate(['user', 'tasks']);

    if(!project)
    return res.status(400).send({ error: 'Project not found '});

    return res.send({ project })

   }catch(err){
       return res.status(400).send({error: 'Error loading project'})
   }
});

router.post('/', async (req, res) => {

    try{
        const { title, description, tasks } = req.body;

        const project = await Project.create( { title, description, user: req.userId }); 

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id });
            await projectTask.save();
            project.tasks.push(projectTask);
        }));

        await project.save();
        return res.send({project});

    }catch(err){
        return res.status(400).send({error: 'Error to create a project'})
    }

});

router.put('/:projectId', async (req, res) => {
    
    try{

        const { title, description, tasks } = req.body;

        const project = await Project.findByIdAndUpdate(req.params.projectId, { title, description}, {new: true}); //{ new: true } return the new object ufter the updating 

        project.tasks = [];
        await Task.remove({ project: project._id });
        
        //This function will finish executing first before saving the project
        await Promise.all(tasks.map(async task => {

            const projectTask = new Task({...task, project: project._id});
            await projectTask.save();
            project.tasks.push(projectTask);

        }));

        await project.save();

        return res.send({ project });

    }catch(err){
        return res.status(400).send({ error: 'Error updating project'})
    }

});

router.delete('/:projectId', async (req, res) =>{

    try{
       await Project.findByIdAndRemove(req.params.projectId);
        return res.send();

    }catch(err){
        return res.status(400).send({error: 'Error deleting project'});
    }
    
});

module.exports = app => app.use('/project', router);