const { globalLink } = require('../app');
const db = require('../db');

exports.profilePage = async (req, res, next) => {
  db.manyOrNone(`select a.group_id,
  a.name as group_name, a.class_number,
  a.branch, a.language, count(*) as group_students_count
  from groups a
  join group_students b
  on a.group_id = b.group_id
  where a.active = true
  GROUP BY a.group_id`)
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
        .then(() => res.redirect(`${globalLink}/users/dashboard`))
        .catch((err)=> {
          console.log(err)
          res.status(500).redirect(`${globalLink}/`)
        })
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
    return t.manyOrNone(`delete from users 
      where user_id = ${req.body.student__delete}`)
      .then(() => res.status(200).redirect(`${globalLink}/users/dashboard`))
  });
};



exports.updateUserPage = async (req, res, next) => {

  db.task(t => {

    return t.manyOrNone(`select * from users`)
    .then((users) => {
      res.status(200).render(`./updatePages/updateUserPage`, {
        globalLink,
        users
      });
    });
  });

};



exports.updateUser = async (req, res, next) => {

  db.task(t => {

    return t.oneOrNone(`UPDATE users SET 
    username = '${req.body.username}',
    email = '${ req.body.email}',
    password = '${ req.body.password}',
    role = '${ req.body.role}'
    where user_id = ${req.body.user_id}`)
    .then(() => {
      res.status(200).redirect(`${globalLink}/users/update`)
    });
  });

};

exports.asyncFindOne = async (req, res, next) => {

  db.task(t => {

    const userId = req.params.user_id;

    return t.oneOrNone(`select * from users where user_id = ${userId}`)
    .then((userData) => {
      res.status(200).json({userData});
    })
  });
};