const globalLink = require('./../app').globalLink;
const db = require('./../db');

exports.profilePage = async (req, res, next) => {
  const user = req.body;
  const params = req;
  console.log(res.locals);

  let groups;

  db.manyOrNone(`SELECT * from groups`)
  .then(function (data) {
    groups = data;
    console.log(data);
    res.status(200).render('./pages/profilePage', {
      groups,
      globalLink
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