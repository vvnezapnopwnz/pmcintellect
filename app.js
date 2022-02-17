const path = require('path');
const express = require('express');
// const morgan = require('morgan');
const cookieParser = require('cookie-parser');

if (process.env.NODE_ENV === 'development') {
  process.env.NODE_DEST = 'http://localhost:3000';
}

exports.globalLink = process.env.NODE_DEST;

const viewRouter = require('./routes/viewRoutes');
const userRouter = require('./routes/userRoutes');
const groupRouter = require('./routes/groupRoutes');
const studentRouter = require('./routes/studentRoutes');
const testRouter = require('./routes/testRoutes');
const complexTestRouter = require('./routes/complexTestRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/mainPage', {
    globalLink: `${process.env.NODE_DEST}`,
  }));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use('/views', viewRouter);
app.use('/users', userRouter);
app.use('/groups', groupRouter);
app.use('/students', studentRouter);
app.use('/tests', testRouter);
app.use('/complextests', complexTestRouter);
app.use('/reviews', reviewRouter);

module.exports = app;
