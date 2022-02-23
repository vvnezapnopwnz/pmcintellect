const { globalLink } = require('../app');
const db = require('../db');

exports.addTestPage = async (req, res, next) => {

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
      .then(() => res.status(200).render('updatePages/addTest', {
        group,
        students,
        subjects,
        globalLink,
      }));
  });

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


exports.addEntTrialPage = async (req, res, next) => {

 db.task(t => {
  const groupId = req.params.id;
  let group;
  let students;

  return t.oneOrNone(`SELECT * FROM groups WHERE group_id = ${groupId}`)
  .then((groupData) => {
    group = groupData;
    return t.query(`SELECT * from students a
    JOIN group_students b
    ON a.student_id = b.student_id WHERE group_id = ${groupId}`)
  })
  .then((studentsData) => {
    students = studentsData;
  })
  .then(() => res.status(200).render('./updatePages/addEntTrial', {
    group,
    students,
    globalLink,
  }))


 });

};

exports.addEntTrial = async (req, res, next) => {
    
  db.task(t => {

    const groupId = req.params.id;
    const studentsData = [req.body.students].flat();
    const trialDate = req.body.trial_date;

    const students = studentsData.map((student_id) => {
      const student = { id: Number(student_id) };
      student.history__kaz = req.body[`history__kaz__${student_id}`];
      student.reading__literacy = req.body[`reading__literacy__${student_id}`];
      student.math__literacy = req.body[`math__literacy__${student_id}`];
      req.body[`mathematics__${student_id}`] ? student.mathematics = req.body[`mathematics__${student_id}`] : student.mathematics = null;
      req.body[`physics__${student_id}`] ? student.physics = req.body[`physics__${student_id}`] : student.physics = null;
      req.body[`geography__${student_id}`] ? student.geography = req.body[`geography__${student_id}`] : student.geography = null;
      req.body[`biology__${student_id}`] ? student.biology = req.body[`biology__${student_id}`] : student.biology = null;
      req.body[`chemistry__${student_id}`] ? student.chemistry = req.body[`chemistry__${student_id}`] : student.chemistry = null;

      return student;
    });
      
    return t.one(`INSERT INTO group_ent_trials(group_id, trial_date) VALUES(${groupId}, '${trialDate}') RETURNING trial_id`)
    .then(({ trial_id }) => db.tx((tt) => {
      const queries = students.map((student) => {

        return tt.none(`INSERT INTO student_ent_trials_results(trial_id,    student_id, history_kaz_result,   
          reading_literacy_result,
          math_literacy_result,
          mathematics_result,
          physics_result,
          geography_result,
          biology_result,
          chemistry_result) VALUES(${trial_id}, ${student.id},
            ${student.history__kaz},
            ${student.reading__literacy},
            ${student.math__literacy},
            ${student.mathematics},
            ${student.physics},
            ${student.geography},
            ${student.biology},
            ${student.chemistry})`);
      });

      return tt.batch(queries);
    }))
  }).then(() => res.redirect(`${globalLink}/groups/${req.params.id}`))


};



exports.getTrial = async (req, res, next) => {


  db.task(t => {
    
      return t.manyOrNone(`select *, d.name as group_name,
      c.name as student_name
      from group_ent_trials a 
            JOIN student_ent_trials_results b
            ON a.trial_id = b.trial_id
            JOIN students c
            ON b.student_id = c.student_id
          JOIN groups d
          ON a.group_id = d.group_id
            where a.trial_id = ${req.params.trial_id}`)
    .then((results) => res.status(200).render('./pages/trialPage',{
      group:results[0],
      results,
      globalLink,
    }))

  });

}





exports.getNUTrial = async (req, res, next) => {


  db.task(t => {
    
    return t.manyOrNone(`select *, d.name as group_name,
      c.name as student_name
      from group_nu_trials a
      JOIN student_nu_trials_results b
      ON a.trial_id = b.trial_id
      JOIN students c
      on c.student_id = b.student_id
      JOIN groups d
      ON d.group_id = a.group_id
      where a.trial_id = ${req.params.trial_id}`)
    .then((results) => res.status(200).render('./pages/nutrialPage',{
      group:results[0],
      results,
      globalLink,
    }))

  });

}













exports.addNUTrialPage = async (req, res, next) => {

  db.task(t => {
    const groupId = req.params.id;
    let group;
    let students;
  
    return t.oneOrNone(`SELECT * FROM groups WHERE group_id = ${groupId}`)
    .then((groupData) => {
      group = groupData;
      return t.query(`SELECT * from students a
      JOIN group_students b
      ON a.student_id = b.student_id WHERE group_id = ${groupId}`)
    })
    .then((studentsData) => {
      students = studentsData;
    })
    .then(() => res.status(200).render('./updatePages/addNuTrial', {
      group,
      students,
      globalLink,
    }))
  
  
   });





};



exports.addNUTrial = async (req, res, next) => {
  db.task(t => {

    const groupId = req.params.id;
    const studentsData = [req.body.students].flat();
    const trialDate = req.body.trial_date;

    const students = studentsData.map((student_id) => {
      const student = { id: Number(student_id) };
      student.math = req.body[`math__${student_id}`];
      student.critical__thinking = req.body[`critical__thinking__${student_id}`];
      return student;
    });
      

    return t.one(`INSERT INTO group_nu_trials(group_id, trial_date) VALUES(${groupId}, '${trialDate}') RETURNING trial_id`)
    .then(({ trial_id }) => db.tx((tt) => {
      const queries = students.map((student) => {

        return tt.none(`INSERT INTO student_nu_trials_results(trial_id, student_id,
          math_result,   
          critical_thinking_result) VALUES(${trial_id}, ${student.id}, ${student.math}, ${student.critical__thinking})`);
      });

      return tt.batch(queries);
    }))
  }).then(() => res.redirect(`${globalLink}/groups/${req.params.id}`))


  
};