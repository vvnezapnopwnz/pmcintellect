const { globalLink } = require('../app');
const db = require('../db');

exports.profilePage = async (req, res, next) => {
  db.manyOrNone('SELECT * from groups WHERE active')
    .then((groups) => {
      res.status(200).render('./pages/profilePage', {
        groups,
        globalLink,
        user: res.locals.user,
      });
    })
    .catch((error) => {
      console.log('ERROR:', error);
    });
};
