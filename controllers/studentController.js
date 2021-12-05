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
  .then(() => db.manyOrNone(`SELECT * FROM student_results
   WHERE student_id = ${student.student_id}`)
  .then((results) => student.results = results))
  .then(() => db.task(t => {

    const queries = student.results.map((result) => {

      return db.oneOrNone(`SELECT * FROM group_tests
       WHERE test_id = ${result.test_id}`)
       .then((test) => result.test_info = test)
       .then(() => db.oneOrNone(`SELECT * FROM subjects WHERE
       id = ${result.test_info.subject_id}`))
       .then((subjectData) => result.subject = subjectData)
    });
    return t.batch(queries);
  }))
  .then(() => res.status(200)
  // .render('./pages/studentPage', {
  //     student,
  //     globalLink,
  //   }))
  .json({
    student,
    subjects: [...new Set(student.results.map((result) => result.subject))], 
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

