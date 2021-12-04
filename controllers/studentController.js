
const globalLink = require('./../app').globalLink;
const db = require('./../db');


exports.createStudentPage = async (req, res, next) => {

    res.status(200).render('./createPages/student', {
      globalLink,
    });
};

exports.createStudent = async (req, res, next) => {
  const { name, class_number }= req.body;

    db.one(`INSERT INTO students(name, class_number) VALUES('${name}', ${class_number})`+ ' RETURNING student_id')
      .then( ({ student_id }) => {
        console.log(student_id);
        db.one(`SELECT * from students WHERE student_id = ${student_id}`)
        .then(({student_id}) => res.status(200).redirect(`${globalLink}/students/${student_id}`))
      })
    .catch( (err) => {
      res.status(500).json({
        err
      })
    });
};


exports.deleteStudentPage = async (req, res, next) => {
  



}

exports.getStudent = async (req, res, next) => {
  console.log(req.params)
  const studentId = req.params.id
  let student;

  db.one(`SELECT * from students WHERE student_id = ${studentId}`)
  .then(function (data) {
    student = data;
    console.log(data);
    res.status(200).render('./pages/studentPage', {
      student,
      globalLink
    })
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  });
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
    console.log('ERROR:', error)
  });
};

