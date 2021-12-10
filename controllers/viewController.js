const globalLink = require('./../app').globalLink;
const db = require('./../db');


exports.getStudentView = async (req, res, next) => {

const student_id = req.params.id

let student;



db.oneOrNone(`SELECT * from students WHERE student_id = ${student_id}`)
.then((data) => student = data)
.then(() => db.manyOrNone(`SELECT * FROM student_results a 
JOIN group_tests b ON 
a.test_id = b.test_id
JOIN subjects c ON
b.subject_id = c.id
 WHERE student_id = ${student_id}`)
.then((results) => student.results = results))
.then(() => db.manyOrNone(`SELECT * FROM student_subjects a
JOIN subjects b ON a.subject_id = b.id WHERE student_id = ${student_id}`))
.then((subjects) => 

  db.manyOrNone(`SELECT b.posting_date, a.record_id, a.review_id, a.student_id,
  a.attendance, a.activity, a.homework, b.group_id,
  c.name
  FROM student_records a
  JOIN group_reviews b
  ON a.review_id = b.review_id
  JOIN subjects c ON
  b.subject_id = c.id
  WHERE student_id = ${student_id}`)
  .then((records) => 
  res.status(200)
  .render('./pages/viewPage', {
    student,
    subjects,
    records,
    globalLink,
  })))
.catch(function (error) {
  console.log(error);
  res.redirect(`${globalLink}/`);
})


}