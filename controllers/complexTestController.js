const { globalLink } = require('../app');
const db = require('../db');


exports.getComplexTest = async (req, res, next) => {

  db.task(t => {
    const testId = req.params.id;
    let subjects;
    let results;

    return t.manyOrNone(`select distinct a.id, a.format, a.posting_date,
    d.name as subject_name,
	  d.id as subject_id
    from group_custom_tests a
    join custom_tests_results b
    on a.id = b.custom_test_id
    join subjects d
    on d.id = b.subject_id
    where a.id = ${testId}`)
    .then((subjectsData) => subjects = subjectsData)
    .then(() => t.manyOrNone(`select a.id, a.format, a.posting_date,
    c.name as student_name,
    d.name as subject_name,
    b.max_points, b.points
    from group_custom_tests a
    join custom_tests_results b
    on a.id = b.custom_test_id
    join students c
    on b.student_id = c.student_id
    join subjects d
    on d.id = b.subject_id
    where a.id = ${testId}`))
      .then((resultsData) => {

        results = resultsData.map((result) => {
          result.percent =  Math.round(result.points / result.max_points * 100);
          return result;
        });
        res.status(200).render('./pages/complexTestPage', {
          results,
          subjects,
          group: results[0],
          globalLink,
        })
      })

  });

};


exports.addComplexTestPage = async (req, res, next) => {

    db.task(t => {
        const groupId = req.params.id;
        let group;
        let students;
        let subjects;
    
        return t.oneOrNone(`SELECT * from groups WHERE group_id = ${groupId}`)
          .then((groupData) => group = groupData)
          .then(() => db.manyOrNone(`SELECT * from group_students WHERE group_id = ${groupId}`))
          .then((thisGroupStudentsIds) => thisGroupStudentsIds.reduce((acc, { student_id }) => {
            const newAcc = acc.then((contents) => db.oneOrNone(`SELECT * from students WHERE(student_id = ${student_id} AND active)`)
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
          .then(() => res.status(200).render('updatePages/addComplexTest', {
            group,
            students,
            subjects,
            globalLink,
          }));
      });

};

exports.addComplexTest = async (req, res, next) => {

  db.task(t => {

    const data = Object.keys(req.body);

    const postingDate = req.body.complex_test_date;
    const format = req.body.complex_test_format;
    const groupId = req.params.id;
    const students = [req.body.students].flat();

    const results = data.filter((el) => {
      const resultInfo = el.split('__');
      if(students.includes(resultInfo[2])) {
        return el;
      } 

      return;
      }).map((el) => {
        const resultInfo = el.split('__');
        const resultValue = req.body[el];
        const maxPoints = `max_points__${resultInfo[4]}`

        const resultData = {
          studentId: resultInfo[2],
          subjectId: resultInfo[4],
          maxPoint: req.body[maxPoints],
          points: resultValue,
        };
        return resultData;
      });

    return t.one(`INSERT INTO group_custom_tests(format, group_id, posting_date)
    VALUES('${format}', ${groupId}, '${postingDate}') RETURNING id`)
    .then(({ id }) => db.tx(tt => {

      const queries = results.map((result) => {
        return tt.none(`INSERT INTO custom_tests_results(custom_test_id, student_id, subject_id,
          max_points, points) VALUES(${id}, ${result.studentId}, ${result.subjectId},
          ${result.maxPoint}, ${result.points})`);
      });
      return tt.batch(queries);
    }))
    .then(() => res.status(200).redirect(`${globalLink}/groups/${groupId}`));
  });      

};



exports.removeComplexTestPage = async (req, res, next) => {


  db.task(t => {

    const groupId = req.params.id;

    return t.manyOrNone(`select distinct a.id, a.format, a.posting_date,
    a.group_id, c.name
    from group_custom_tests a
    join custom_tests_results b
    on a.id = b.custom_test_id
    join groups c
    on c.group_id = a.group_id
    WHERE a.group_id = ${groupId}`)
    .then((tests) => res.status(200).render('./removePages/removeComplexTest', {
          globalLink,
          tests,
          group: tests[0]
        }));
  });

};


exports.removeComplexTest = async (req, res, next) => {
  const groupId = req.params.id;
  const test = req.body.test;

  db.task(t => {

    const customTest = req.body.test;
    const groupId = req.params.id;

    return t.query(`DELETE FROM custom_tests_results WHERE custom_test_id = ${customTest}`)
      .then(() => t.query(`DELETE FROM group_custom_tests WHERE id = ${customTest}`))
          .then(() => res.redirect(`${globalLink}/groups/${groupId}`))
  })
};
