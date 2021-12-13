const { globalLink } = require('../app');
const db = require('../db');

exports.getStudentView = async (req, res, next) => {
  const student_id = req.params.id;

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
    .then((subjects) => db.manyOrNone(`SELECT b.posting_date, a.record_id, a.review_id, a.student_id,
  a.attendance, a.activity, a.homework, b.group_id,
  c.name
  FROM student_records a
  JOIN group_reviews b
  ON a.review_id = b.review_id
  JOIN subjects c ON
  b.subject_id = c.id
  WHERE student_id = ${student_id}`)
      .then((records) => res.status(200)
        .render('./pages/viewPage', {
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

exports.getDashboardOverview = async (req, res, next) => {

  db.task(t => {
    let groups;
    let students;
    let users;
    return t.one(`SELECT count(group_id) FROM groups where active`)
    .then((groupsData) => groups = groupsData)
    .then(() => t.one(`SELECT count(student_id) from students where active`))
    .then((studentsData) => students = studentsData)
    .then(() => t.any(`SELECT * from users where active`))
    .then((usersData) => users = usersData)
    .then(() => t.any(`select a.test_id, a.date, a.group_id, 
    c.name as subject_name,
    d.name as group_name, a.format,
    a.max_points, avg(b.points),
    count(b.student_id)
    from group_tests a
    JOIN student_results b
    ON a.test_id = b.test_id
    JOIN subjects c
    ON a.subject_id = c.id
    JOIN groups d
    ON a.group_id = d.group_id
    GROUP BY a.test_id, d.name, c.name
    ORDER BY a.date DESC
    LIMIT 10`))
    .then((tests) => res.status(200).render('./pages/dashboardPage',{
      groups,
      students,
      users,
      globalLink,
      tests,
    }))

  
  })
}

exports.getManagersOverview = async (req, res, next) => {

  db.task(t => {
    let students;

    return t.manyOrNone('SELECT * from students WHERE active')
    .then((data) => {
      students = data;
      res.status(200).render('./pages/managersView', {
        students,
        globalLink,
      });
    })
    .catch((error) => {
      res.redirect(`${globalLink}/`);
    });
  });

};