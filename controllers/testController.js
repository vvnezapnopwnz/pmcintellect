const { globalLink } = require('../app');
const db = require('../db');

exports.addTestPage = async (req, res, next) => {
  const groupId = req.params.id;
  let group;
  let students;
  let subjects;

  db.one(`SELECT * from groups WHERE group_id = ${groupId}`)
    .then((groupData) => group = groupData)
    .then(() => db.manyOrNone(`SELECT * from group_students WHERE group_id = ${groupId}`))
    .then((thisGroupStudentsIds) => thisGroupStudentsIds.reduce((acc, { student_id }) => {
      const newAcc = acc.then((contents) => db.one(`SELECT * from students WHERE student_id = ${student_id}`)
        .then((students) => contents.concat(students)));
      return newAcc;
    }, Promise.resolve([]))
      .then((studentsData) => students = studentsData))
    .then(() => db.manyOrNone(`SELECT * from group_subjects WHERE group_id = ${groupId}`))
    .then((thisGroupSubjects) => thisGroupSubjects.reduce((acc, { subject_id }) => {
      const newAcc = acc.then((contents) => db.one(`SELECT * from subjects WHERE id = ${subject_id}`)
        .then((subjects) => contents.concat(subjects)));
      return newAcc;
    }, Promise.resolve([]))
      .then((subjectsData) => subjects = subjectsData))
    .then(() => res.status(200).render('updatePages/addTest', {
      group,
      students,
      subjects,
      globalLink,
    }));
};






exports.addTest = async (req, res, next) => {

  db.task(t => {
    const groupId = req.params.id;
    const { subject, testing_date, testing_format, 
      max_points, students, student_points } = req.body;
    const studentIds = [students].flat();
    const studentPoints = [student_points].flat();
  
    const studentResults = studentIds.map((studentId, index) => {
      const studentTest = {};
      studentTest.studentId = Number(studentId);
      studentTest.studentPoints = Number(studentPoints[index]);
      return studentTest;
    });
      return t.one(`INSERT INTO group_tests(date, group_id, subject_id, format, max_points)
        VALUES('${testing_date}', ${groupId}, ${subject}, '${testing_format}', ${max_points})
          RETURNING test_id`)
        .then(({ test_id }) => db.tx(tt => {
          const queries = studentResults.map((result) => {
              return tt.none(`INSERT INTO student_results(test_id, student_id, points)
                VALUES(${test_id}, ${result.studentId}, ${result.studentPoints})`);
          });
          return tt.batch(queries);
        }))
        .then(() => res.status(200).redirect(`${globalLink}/groups/${groupId}`));
  });
};




exports.removeTestPage = async (req, res, next) => {
  const groupId = req.params.id;
  let tests;

  db.manyOrNone(`SELECT * from group_tests WHERE group_id = ${groupId}`)
    .then((testsData) => tests = testsData)
    .then(() => {
      db.tx((t) => {
        const queries = tests.map((test) => t.manyOrNone(`SELECT * from subjects WHERE id = ${test.subject_id}`)
          .then((subjectData) => test.subjectName = subjectData[0].name));
        return t.batch(queries);
      })
        .then(() => db.oneOrNone(`SELECT * from groups WHERE group_id = ${groupId}`))
        .then((group) => res.status(200).render('./removePages/removeTest', {
          globalLink,
          tests,
          group,
        }));
    });
};

exports.removeTest = async (req, res, next) => {
  const groupId = req.params.id;
  const test = req.body.test;

  db.query(`DELETE FROM student_results WHERE test_id = ${test}`)
    .then(() => db.query(`DELETE FROM group_tests WHERE test_id = ${test}`))
    .then(() => res.redirect(`${globalLink}/groups/${groupId}`))
    .catch((err) => res.status(500).send(err));
};

exports.getTest = async (req, res, next) => {
  const testId = req.params.id;
  db.query(`SELECT a.test_id, a.date, a.group_id,
    a.format, a.max_points, b.student_id, b.points, 
    d.name AS student_name, e.name AS subject_name
    FROM group_tests a
    JOIN student_results b
    ON a.test_id = b.test_id
    JOIN group_students c
    ON b.student_id = c.student_id
    JOIN students d
    ON c.student_id = d.student_id
    JOIN subjects e
    ON a.subject_id = e.id 
    WHERE a.test_id = ${testId}`).then((results) => res.status(200)
    .render('./pages/testPage', {
      results,
      group: results[0],
      globalLink,
    }));
};
