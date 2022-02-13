const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { globalLink } = require('../app');
const db = require('../db');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});

const createSendToken = (user, statusCode, res) => {


  const token = signToken(user.user_id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  // if(user.role !== 'admin') {
  res.redirect(`${globalLink}/users/profile`);
};

exports.login = async (req, res, next) => {
  let user;
  const { email, password } = req.body;

  db.one(`SELECT * from users WHERE email = '${email}' AND active = true`)
    .then((data) => {
      user = data;

      if (!user.email || user.password !== password) {
        res.status(401).send({ message: 'Неверный email или пароль',});
      } else {
        createSendToken(user, 200, res);
      }
    })
    .catch((error) => {
      console.log('ERROR:', error);
    });
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).redirect(`${globalLink}`);
};

exports.isLoggedIn = async (req, res, next) => {
  console.log('is logged in')
  if (req.cookies.jwt) {
    // 1) verify token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET,
    );
    db.one(`SELECT * from users WHERE user_id = '${decoded.id}'`)
      .then((data) => {
        res.locals.user = data;
        console.log(res.locals.user.username + ` - role: ${res.locals.user.role}`)
        console.log(req.get('host') + req.originalUrl)
        return next();
      })
      .catch((err) => {
        res.redirect(globalLink);
      });
  } else {
    res.redirect(globalLink);
  }
};
