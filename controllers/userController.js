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


exports.createUserPage = async (req, res, next) => {
 res.status(200).render(`./createPages/user`, {
   globalLink,
 })

}


exports.createUser = async (req, res, next) => {

  db.task(t => {
    console.log(req.body)
    const username = req.body.username;

    return t.oneOrNone(`INSERT INTO users(username, password, email, role)
      VALUES('${username}', '${req.body.password}', '${req.body.email}',
        '${req.body.role}')`)
        .then(() => res.redirect(`${globalLink}/users/dashboard`));
  });
  
};

exports.createNewSubjectPage = async (req, res, next) => {

  db.task(t => {

    return t.manyOrNone(`select * from subjects order by id desc`)
      .then((subjects) => res.status(200).render('./createPages/createNewSubject', {
        subjects,
        globalLink,
      }))
  });

};


exports.createNewSubject = async (req, res, next) => {

  db.task(t => {

      return t.query(`insert into subjects(name) values('${req.body.subject__name}')`)
        .then(() => res.status(200).redirect(`${globalLink}/users/addnewsubject`))
  });
};


exports.deleteUserPage = async (req, res, next) => {

  db.task(t => {

    return t.manyOrNone(`select * from users`)
      .then((users) => res.status(200).render(`./deletePages/deleteUser`, {
        globalLink,
        users,
      }));
  });

};


exports.deleteUser = async (req, res, next) => {
  db.task(t => {
    return t.manyOrNone(`update users set active = false 
      where user_id = ${req.body.student__delete}`)
      .then(() => res.status(200).redirect(`${globalLink}/users/dashboard`))
  });
};