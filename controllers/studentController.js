const globalLink = require('./../app').globalLink;
const db = require('./../db');


exports.createStudentPage = async (req, res, next) => {

    res.status(200).render('./createPages/student', {
      globalLink,
    }).catch((err) => res.status(500).redirect(`${globalLink}/`));
};

exports.createStudent = async (req, res, next) => {
  const { name, class_number }= req.body;

    db.one(`INSERT INTO students(name, class_number) VALUES('${name}', ${class_number})`+ ' RETURNING student_id')
      .then( ({ student_id }) => {
        db.one(`SELECT * from students WHERE student_id = ${student_id}`)
        .then(({student_id}) => res.status(200).redirect(`${globalLink}/students/${student_id}`))
      })
    .catch( (err) => {
      res.status(500).redirect(`${globalLink}/students/`);
    });
};


exports.deleteStudentPage = async (req, res, next) => {
  db.manyOrNone(`SELECT * FROM students`)
  .then((students) => {
    res.status(200).render('./deletePages/deleteStudent', {
      students,
      globalLink,
    });
  }).catch( (err) => res.status(500).redirect(`${globalLink}/`));

};



exports.deleteStudent = async (req, res, next) => {
  const studentForDeletion = req.body.student;

  db.task(t => {

    return t.query(`DELETE FROM student_results WHERE student_id = ${studentForDeletion}`)
      .then(() => db.query(`DELETE FROM group_students WHERE student_id = ${studentForDeletion}`))
      .then(() => db.query(`DELETE FROM students WHERE student_id = ${studentForDeletion}`))
  .then(() => res.status(200).redirect(`${globalLink}/students/`));
  
  }).catch( (err) => res.status(500).redirect(`${globalLink}`));

};



exports.getStudent = async (req, res, next) => {
  const studentId = req.params.id
  let student;

  db.one(`SELECT * from students WHERE student_id = ${studentId}`)
  .then((data) => student = data)
  .then((results) => student.results = results)
  .then(() => db.manyOrNone(`SELECT * FROM student_results a 
  JOIN group_tests b ON 
  a.test_id = b.test_id
  JOIN subjects c ON
  b.subject_id = c.id
   WHERE student_id = ${student.student_id}`)
  .then((results) => student.results = results))
  .then(() => res.status(200)
  // .render('./pages/studentPage', {
  //     student,
  //     globalLink,
  //   }))
  .json({
    student,
  }))
  .catch(function (error) {
    console.log(error);
    // res.redirect(`${globalLink}/`);
  })



};


exports.getAll = async (req, res, next) => {
  let students;

  db.manyOrNone(`SELECT * from students`)
  .then(function (data) {
    students = data;
    res.status(200).render('./pages/studentsAll', {
      students,
      globalLink,
    })
  })
  .catch(function (error) {
    res.redirect(`${globalLink}/`);
  });
};

