const { globalLink } = require('../app');
const db = require('../db');

exports.getStudentView = async (req, res, next) => {

  db.task(t => {

    const student_id = req.params.id;
    let student;
    let testResults;
    const currentDate  = new Date();
    var firstDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    firstDayofThisMonth = firstDayDate.toLocaleDateString('ru-RU').split('.').reverse().join('-');

    return t.oneOrNone(`SELECT * from students WHERE student_id = ${student_id}`)
    .then((data) => student = data)
    .then(() => t.manyOrNone(`SELECT * FROM student_results a 
                                JOIN group_tests b ON 
                                a.test_id = b.test_id
                                JOIN subjects c ON
                                b.subject_id = c.id
                                WHERE student_id = ${student_id}`)
    .then((results) => student.results = results))
    .then(() => t.manyOrNone(`select * from group_ent_trials a
                              JOIN student_ent_trials_results b
                              ON a.trial_id = b.trial_id
                              WHERE b.student_id = ${student_id}`))
    .then((trialsData) => {
      student.trials = trialsData;
    })
    .then(() => t.manyOrNone(`select * from group_nu_trials a
                              JOIN student_nu_trials_results b
                              ON a.trial_id = b.trial_id
                              WHERE b.student_id = ${student_id}`))
    .then((nuTrialsData) => {
    student.nuTrials = nuTrialsData;
    })
    .then(() => t.manyOrNone(`select distinct a.format
                              from group_custom_tests a
                              join custom_tests_results b
                              on a.id = b.custom_test_id
                              where b.student_id = ${student_id}`)
    )
    .then(() => t.manyOrNone(`SELECT * FROM student_subjects a
                                JOIN subjects b ON a.subject_id = b.id
                                WHERE student_id = ${student_id}`))
     .then((subjectsData) => {
        student.subjects = subjectsData;
      })
      .then(() => t.manyOrNone(`select *, c.name as subject_name
      from custom_tests_results a
      join group_custom_tests b
      on a.custom_test_id = b.id
      join subjects c
      on a.subject_id = c.id
      where a.student_id = ${student_id} ORDER BY a.test_date ASC`))
      .then((testResultsData) => {
        testResults = testResultsData;
      })
    .then(() => t.manyOrNone(`SELECT b.posting_date, a.record_id,
                                a.review_id, a.student_id,
                                a.attendance, a.activity, a.homework, b.group_id,
                                c.name, a.comment
                                FROM student_records a
                                JOIN group_reviews b
                                ON a.review_id = b.review_id
                                JOIN subjects c ON
                                b.subject_id = c.id
                                WHERE student_id = ${student_id}
                                and
                                posting_date >= '${firstDayofThisMonth}'::date  and
                                posting_date <= '${firstDayofThisMonth}'::date +  INTERVAL '1 month'
                                ORDER BY b.posting_date DESC`)
      .then((records) => res.status(200)
        .render('./pages/viewPage', {
          student,
          subjects: student.subjects,
          records,
          globalLink,
          testResults,
        })))
    .catch((error) => {
      console.log(error);
      res.redirect(`${globalLink}/`);
    });

  });



};

exports.getDashboardOverview = async (req, res, next) => {

  db.task(t => {
    let groups;
    let students;
    let users;
    return t.manyOrNone(`SELECT * FROM groups where active`)
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