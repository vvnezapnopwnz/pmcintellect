const { globalLink } = require('../app');
const db = require('../db');


exports.getComplexTest = async (req, res, next) => {

  db.task(t => {
    const testID = req.params.id;
    let subjects;
    let results;

    return t.manyOrNone(`select distinct a.id, a.format,
    d.name as subject_name,
	  d.id as subject_id,
	  e.name as group_name, a.group_id
    from group_custom_tests a
    join custom_tests_results b
    on a.id = b.custom_test_id
    join subjects d
    on d.id = b.subject_id
	join groups e
	on a.group_id = e.group_id
    where a.id = ${testID}`)
    .then((subjectsData) => subjects = subjectsData)
    .then(() => t.manyOrNone(`select a.id, a.format,
    c.name as student_name,
    d.name as subject_name,
    b.max_points, b.points,
	b.test_date
    from group_custom_tests a
    join custom_tests_results b
    on a.id = b.custom_test_id
    join students c
    on b.student_id = c.student_id
    join subjects d
    on d.id = b.subject_id
    where a.id = ${testID}`))
      .then((resultsData) => {

        results = resultsData.map((result) => {
          result.percent =  Math.round(result.points / result.max_points * 100);
          return result;
        });
        res.status(200).render('./pages/complexTestPage', {
          results,
          subjects,
          group: subjects[0],
          globalLink,
        })
      }).catch((err) => {
        res.status(200).redirect(`${globalLink}/groups/${groupId}`)
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
        .then(() => db.manyOrNone(`select * from group_students a
        join students b
        on a.student_id = b.student_id
        where a.group_id = ${groupId} and b.active = true`))
        .then((studentsData) => students = studentsData)
        .then(() => db.manyOrNone(`select * from group_subjects a
          join subjects b
          on a.subject_id = b.id
          where a.group_id = ${groupId}`))
          .then((subjectsData) => subjects = subjectsData)
          .then(() => res.status(200).render('updatePages/addComplexTest', {
            group,
            students,
            subjects,
            globalLink,
          }));
      });

};

exports.addComplexTest = async (req, res, next) => {

  const groupId = req.params.id;

  db.task(t => {

    const data = Object.keys(req.body);
    const format = req.body.complex_test_format;
    const students = [req.body.students].flat();
    let testID;
    const results = data.filter((el) => {
      
      const resultInfo = el.split('__');

      if(students.includes(resultInfo[2])) {
        return el;
      } 
      
      return;
      }).map((el) => {
        const resultInfo = el.split('__');
        const resultValue = req.body[el];
        const maxPoints = `max_points__${resultInfo[4]}`;
        const testsDate = `complex_test_date__${resultInfo[4]}`;
        const testsTheme = `complex_test_theme__${resultInfo[4]}`;
        const scoreFive = `score_five__${resultInfo[4]}`;
        const scoreFour = `score_four__${resultInfo[4]}`;
        const scoreThree = `score_three__${resultInfo[4]}`;

        if(resultValue == '' || resultValue == undefined) {
          return;
        }
        const resultData = {
          studentId: resultInfo[2],
          subjectId: resultInfo[4],
          maxPoint: req.body[maxPoints],
          testDate: req.body[testsDate],
          testTheme: req.body[testsTheme],
          points: resultValue,
          scoreFive: req.body[scoreFive],
          scoreFour: req.body[scoreFour],
          scoreThree: req.body[scoreThree],
        };
        console.log(resultData)
        return resultData;
      }).filter((el) => el !== undefined);


      console.log(results)

    return t.one(`INSERT INTO group_custom_tests(format, group_id)
    VALUES('${format}', ${groupId}) RETURNING id`)
    .then(({ id }) => db.tx(tt => {

      const queries = results.map((result) => {
        return tt.none(`INSERT INTO custom_tests_results(custom_test_id, student_id, subject_id,
          test_date, theme, max_points, points, score_five, score_four, score_three) VALUES(${id}, ${result.studentId}, ${result.subjectId},
          '${result.testDate}', '${result.testTheme}', ${result.maxPoint}, ${result.points},
          ${result.scoreFive == '' ? 89 : result.scoreFive}, ${result.scoreFour == '' ? 69 : result.scoreFour}, ${result.scoreThree == '' ? 49 : result.scoreThree})`);
      });
      return tt.batch(queries);
    }))
    .then(() => res.status(200).redirect(`${globalLink}/groups/${groupId}`))
  }).catch((err) => {
   res.status(200).redirect(`${globalLink}/groups/${groupId}`)
  })    

};



exports.removeComplexTestPage = async (req, res, next) => {


  db.task(t => {

    const groupId = req.params.id;

    return t.manyOrNone(`select distinct a.id, a.format, b.test_date,
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
