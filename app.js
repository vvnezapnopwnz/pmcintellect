const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

exports.globalLink = process.env.NODE_DEST;

const userRouter = require('./routes/userRoutes');
const groupRouter = require('./routes/groupRoutes');
const studentRouter = require('./routes/studentRoutes');
const testRouter = require('./routes/testRoutes');

const app = express();



app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/mainPage', {
    globalLink: 'http://localhost:3000',
  }))

if (process.env.NODE_ENV === 'development') {
 app.use(morgan('dev'));
}

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  app.use('/users', userRouter);
  app.use('/groups', groupRouter);
  app.use('/students', studentRouter);
  app.use('/tests',testRouter); 
  
  module.exports = app;