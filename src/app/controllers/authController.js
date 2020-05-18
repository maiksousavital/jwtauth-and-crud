const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const mailer = require('../../modules/mailer');
const authConfig = require('../../config/auth');

const User = require('../models/user');

const router = express.Router();

function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret,{
        expiresIn: 86400,
    });
}

router.post('/register', async(req, res) => {
   
    //Get the email from req.body
    const { email } = req.body;

    try{
        //Verify if user already exists
        if(await User.findOne({ email }))
        return res.status(400).send({error: 'User already exists.'});

        const user = await User.create(req.body);

        //Does not return the password
        user.password = undefined;

        return res.send({user,
                         token: generateToken({ id: user.id }),
         });

    }catch(err){
        return res.status(400).send({error: 'Registration failed'});
    }
});

router.post('/authenticate', async (req, res) =>{

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if(!user)
    return res.status(400).send({error: 'User not found'});

    //Compare the password provided by the user with the password from database
    if(!await bcrypt.compare(password, user.password))
    return res.status(400).send({error: 'Invalid password.'});

    //Does not return the password
    user.password = undefined;

    

    res.send({ user, 
               token: generateToken({ id: user.id}),
    });

});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;
    try{
        const user = await User.findOne({ email });

        if(!email)
        return res.status(400).send({error: 'User not found'});

        //Generate token to recover user' password
        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        
        await User.findByIdAndUpdate(user.id, {
            '$set':{
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        await mailer.sendMail({
            
            to: email,
            from: 'maikbatera1@gmail.com',
            template: 'forgot_password',
            context: { token }

        },(err) => {
            if(err)           
            return res.status(400).send({error: 'Cannot send forgot password email'});

            return res.send();
        });


    }catch(err){        
        return res.status(400).send({error: 'Error to recover password'})
    }


});

router.post('/reset_password', async (req,res) => {

const {email, token, password } = req.body;
try{
    const user =  await User.findOne({email})
    .select('+passwordResetToken passwordResetExpires');

    if(!user)
    return res.status(400).send({error: 'User nor fount'});

    if(token !== user.passwordResetToken)
    res.status(400).send({error: 'Invalid token'});

    const now = new Date();

    if(now > user.passwordResetExpires)
    res.status(400).send('This token is expired, generate a new one');

    user.password = password;

    await user.save();

    res.send();


}catch(err){
    if(err)    
    return res.status(400).send({error: 'Cannot reset password'});
}

});

module.exports = app => app.use('/auth', router);
