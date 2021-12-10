const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const globalLink = require('./../app').globalLink;
const db = require('./../db');


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
};


const createSendToken = (user, statusCode, res) => {
  console.log(user.username)
  console.log(user.user_id)

    const token = signToken(user.user_id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };
   cookieOptions.secure = true;
    console.log(token)
    res.cookie('jwt', token, cookieOptions);
  
    // Remove password from output
    user.password = undefined;
  
    // if(user.role !== 'admin') {
      res.redirect(`${globalLink}/users/profile`);

};

  


exports.login = async (req, res, next) => {

  let user;
  const { email, password } = req.body;

  db.one(`SELECT * from users WHERE email = '${email}'`)
  .then(function (data) {
    user = data;

    if(!user.email || user.password !== password) {
      console.log('Wrong email or password')
    } else {
      console.log('Success')
      createSendToken(user, 200, res);
    }
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  });

};


  exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).redirect(`${globalLink}`);
};




// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  console.log('LoggedIn middlware')
  if (req.cookies.jwt) {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
        db.one(`SELECT * from users WHERE user_id = '${decoded.id}'`)
        .then(function (data) {
          // user = data;
          console.log(data)
          res.locals.user = data;
          return next();
        })
        .catch(function (err) {
          res.redirect(globalLink)
        })
      } else {
        res.redirect(globalLink)
      }

};