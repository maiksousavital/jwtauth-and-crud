const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-handlebars'); //Email templates

const {host, port, user, pass} = require('../config/mail.json');



const transport = nodemailer.createTransport({
    host,
    port,
    auth: {
      user,pass
    }
  });

  const handlebarOptions = {
    viewEngine: {
      extName: ".handlebars",
      defaultLayout: false,
    },
    viewPath: path.resolve('./src/resource/mail/auth/')
  };
      
  transport.use('compile', hbs(handlebarOptions));

  module.exports = transport;