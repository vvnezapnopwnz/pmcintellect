const globalLink = require('./../app').globalLink;
const db = require('./../db');

exports.profilePage = async (req, res, next) => {

  db.manyOrNone(`SELECT * from groups WHERE active`)
  .then(function (groups) {
    res.status(200).render('./pages/profilePage', {
      groups,
      globalLink,
      user: res.locals.user,
    })
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  });














  // console.log(user)
    // const groups = await Group.find()
    // console.log(groups.map(group => group._id))



    // res.status(200).render('./pages/profilePage', {
    //   globalLink,
    //   groups
    // });
  };