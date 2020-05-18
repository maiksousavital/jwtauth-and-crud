const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');

module.exports = (req, res, next) => {

    const authHeader = req.headers.authorization;

    //Check if the token was provided
    if(!authHeader)
    return res.status(401).send({error: 'No token provided'});

    //Split the token to verify its format
    const tokenParts = authHeader.split(' ');

    //Verify if the token has 2 parts
    if(!tokenParts.length === 2)
    return res.status(401).send({error: 'Token error' });

    const [ scheme, token] = tokenParts;

    //Verify is the token starts (using regex) with the word Bearer
    if(!/^Bearer$/i.test(scheme))
    return res.status(401).send({error: 'Token malFormatted'});

    //Verify the token
    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if(err)
        return res.status(401).send({error: 'Invalid token'});

        req.userId = decoded.id;

        return next();

    });



};