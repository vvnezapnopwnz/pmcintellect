const { globalLink } = require('../app');
const db = require('../db');

exports.createStudentPage = async (req, res, next) => {
  res.status(200).render('./createPages/student', {
    globalLink,
  }).catch((err) => res.status(500).redirect(`${globalLink}/`));
};

exports.createStudent = async (req, res, next) => {
  const { name, class_number } = req.body;

  db.one(`INSERT INTO students(name, class_number) VALUES('${name}', ${class_number})` + ' RETURNING student_id')
    .then(({ student_id }) => {
      db.one(`SELECT * from students WHERE student_id = ${student_id}`)
        .then(({ student_id }) => res.status(200).redirect(`${globalLink}/students/${student_id}`));
    })
    .catch((err) => {
      res.status(500).redirect(`${globalLink}/students/`);
    });
};

exports.deleteStudentPage = async (req, res, next) => {
  db.manyOrNone('SELECT * FROM students')
    .then((students) => {
      res.status(200).render('./deletePages/deleteStudent', {
        students,
        globalLink,
      });
    }).catch((err) => res.status(500).redirect(`${globalLink}/`));
};

exports.deleteStudent = async (req, res, next) => {
  const studentForDeletion = req.body.student;

  db.task((t) => t.query(`DELETE FROM student_results WHERE student_id = ${studentForDeletion}`)
    .then(() => db.query(`DELETE FROM group_students WHERE student_id = ${studentForDeletion}`))
    .then(() => db.query(`DELETE FROM students WHERE student_id = ${studentForDeletion}`))
    .then(() => res.status(200).redirect(`${globalLink}/students/`))).catch((err) => res.status(500).redirect(`${globalLink}`));
};

exports.getStudent = async (req, res, next) => {
  const studentId = req.params.id;
  let student;
  db.one(`SELECT * from students WHERE student_id = ${studentId}`)
    .then((data) => student = data)
    .then(() => db.manyOrNone(`SELECT * FROM student_results a 
  JOIN group_tests b ON 
  a.test_id = b.test_id
  JOIN subjects c ON
  b.subject_id = c.id
   WHERE student_id = ${student.student_id}`)
      .then((results) => student.results = results))
    .then(() => db.manyOrNone(`SELECT * FROM student_subjects a
  JOIN subjects b ON a.subject_id = b.id WHERE student_id = ${studentId}`))
    .then((subjects) => db.manyOrNone(`SELECT b.posting_date, a.record_id, a.review_id, a.student_id,
    a.attendance, a.activity, a.homework, b.group_id,
    c.name
    FROM student_records a
    JOIN group_reviews b
    ON a.review_id = b.review_id
    JOIN subjects c ON
    b.subject_id = c.id
    WHERE student_id = ${student.student_id}`)
      .then((records) => res.status(200)
        .render('./pages/studentPage', {
          student,
          subjects,
          records,
          globalLink,
        })))
    .catch((error) => {
      console.log(error);
      res.redirect(`${globalLink}/`);
    });
};

exports.getAll = async (req, res, next) => {
  let students;

  db.manyOrNone('SELECT * from students WHERE active')
    .then((data) => {
      students = data;
      res.status(200).render('./pages/studentsAll', {
        students,
        globalLink,
      });
    })
    .catch((error) => {
      res.redirect(`${globalLink}/`);
    });
};

exports.addSubjectToStudentPage = async (req, res, next) => {
  const studentId = req.params.id;

  db.oneOrNone(`SELECT * FROM students WHERE student_id = ${studentId}`)
    .then((student) => {
      db.manyOrNone(`SELECT * from student_subjects a
  INNER JOIN  subjects b
  ON b.id = a.subject_id
  WHERE a.student_id = ${studentId}`)
        .then((studentSubjectsData) => {
          const studentSubjects = studentSubjectsData.map((subject) => subject.id);
          db.manyOrNone('SELECT * FROM subjects')
            .then((subjects) => subjects.filter((subject) => {
              if (studentSubjects.includes(subject.id)) {

              } else {
                return subject;
              }
            })).then((availableSubjects) => res.status(200).render('./updatePages/addStudentSubject', {
              student,
              availableSubjects,
              globalLink,
            }));
        });
    }).catch((err) => res.status(500).json({
      error: err.message,
      text: 'Возникла ошибка, обратитесь в технический отдел',
    }));
};

exports.addSubjectToStudent = async (req, res, next) => {
  const studentId = req.params.id;
  const subjectId = req.body.subject;

  db.oneOrNone(`INSERT INTO student_subjects(student_id, subject_id) Values(${studentId}, ${subjectId})`)
    .then(() => res.status(200).redirect(`${globalLink}/students/${studentId}`))
    .catch((err) => res.status(500).json({
      error: err.message,
      text: 'Возникла ошибка, обратитесь в технический отдел',
    }));
};
