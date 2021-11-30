const { promisify } = require('util');
const jwt = require('jsonwebtoken');
// const User = require('./../models/userModel');
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
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
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


    // console.log('DATA:', data)
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  });


//     const { email, password } = req.body;

//     if (!email || !password) {
//       return next(new Error('Please provide email and password!', 400));
//     }

//     const user = await User.findOne({ email }).select('+password');


// console.log(user)

  
//     if (!user || !(await user.correctPassword(password, user.password))) {
//       return next(new Error('Incorrect email or password', 401));
//     }
  
//     createSendToken(user, 200, res);

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
  console.log('LoggedIN middlware')
  if (req.cookies.jwt) {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
        console.log(decoded)
      // 2) Check if user still exists
      // const currentUser = await User.findById(decoded.id);

        db.one(`SELECT * from users WHERE user_id = '${decoded.id}'`)
        .then(function (data) {
          // user = data;
          console.log(data)
          res.locals.user = data;
          return next();
    
          // console.log('DATA:', data)
        });




      // if (!currentUser) {
      //   return next();
      // }

      // // 3) Check if user changed password after the token was issued
      // if (currentUser.changedPasswordAfter(decoded.id)) {
      //   return next();
      }

      // THERE IS A LOGGED IN USER
};