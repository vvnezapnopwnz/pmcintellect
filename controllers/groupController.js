const { globalLink } = require('../app');
const db = require('../db');

exports.createGroupPage = async (req, res, next) => {
  res.status(200).render('./createPages/group', {
    globalLink,
  });
};

exports.createGroup = async (req, res, next) => {
  const groupData = req.body;

  db.oneOrNone(`INSERT INTO groups(name, class_number)
        VALUES('${groupData.name}', ${Number(groupData.class_number)})` + 'RETURNING group_id')
    .then(({ group_id }) => res.status(200).redirect(`${globalLink}/groups/${group_id}`));
};


exports.getGroup = async (req, res, next) => {

  db.task(t => {
    const groupId = req.params.id;
    let group;
    let students;
    let subjects;
    let tests;
    let complexTests;
    let reviews;
    let trials;
    let nuTrials;

    return t.one(`SELECT * from groups WHERE group_id = '${groupId}'`)
    .then((groupData) => group = groupData)
    .then(() => t.manyOrNone(`SELECT * from group_students a
    JOIN students b ON 
    a.student_id = b.student_id
    WHERE a.group_id = ${groupId} AND b.active = true`))
    .then((groupStudentsData) => students = groupStudentsData)
    .then(() => t.manyOrNone(`SELECT * from group_subjects a
        JOIN subjects b
        ON a.subject_id = b.id 
        where a.group_id = ${groupId}`)
    .then((groupSubjectsData) => subjects = groupSubjectsData))
    .then(() => t.query(`SELECT a.review_id,  a.posting_date, c.name,
    count(b.attendance) AS marked_attendance,
    count(*) filter (where b.attendance) as attendance,
    count(b.activity) AS marked_activity,
    count(*) filter (where b.activity) as activity,
    count(b.homework) AS marked_homework,
    count(*) filter (where b.homework) as homework
    from group_reviews a
    JOIN student_records b
    ON a.review_id = b.review_id
    JOIN subjects c ON a.subject_id = c.id
    WHERE a.group_id = ${groupId}
    GROUP BY a.review_id, c.name`))
    .then((reviewsData) => reviews = reviewsData)
    .then(() => t.query(`select distinct a.id, a.format,
    a.group_id, a.posting_date,
	  avg(b.max_points) as avg_max_points,
	  avg(b.points) as avg_points,
	  count(distinct b.student_id)
    from group_custom_tests a
    join custom_tests_results b
    on a.id = b.custom_test_id
    where a.group_id = ${groupId}
	  GROUP BY a.id
    ORDER BY a.posting_date`))
    .then((complexTestsData) => {

      complexTests = complexTestsData.map((complexTest) => {
        complexTest.percent = Math.round(complexTest.avg_points / complexTest.avg_max_points * 100);
        return complexTest;
      });
    
    })
    .then(() => {
      t.tx((tt) => {
        const queries = complexTests.map((test) => tt.manyOrNone(`select distinct b.name
        from custom_tests_results a
        join subjects b on a.subject_id = b.id
        where a.custom_test_id = ${test.id}`).then((testSubjectsData) => {
          test.test_subjects = testSubjectsData;
        }));
        return tt.batch(queries);
      })
    })
    .then(() => t.manyOrNone(`select a.trial_id, a.trial_date, a.group_id, count(b.student_id),
    avg(b.history_kaz_result) as history_kaz_result,
    avg(b.reading_literacy_result) as reading_literacy_result,
    avg(b.math_literacy_result) as math_literacy_result,
    avg(b.mathematics_result) as mathematics_result,
      avg(b.physics_result) as physics_result,
      avg(b.geography_result) as geography_result,
      avg(b.biology_result) as biology_result,
      avg(b.chemistry_result) as chemistry_result
    from student_ent_trials_results b
        INNER JOIN  group_ent_trials a
        ON a.trial_id = b.trial_id
        WHERE a.group_id = ${groupId}
        GROUP BY a.trial_id`))
    .then((trialsData) => {
      trials = trialsData.map((test) => {
        console.log(test)
        test.avg = Math.round(Number(test.history_kaz_result) + Number(test.reading_literacy_result) + Number(test.math_literacy_result));

        return test;
      })
    })
    .then(() => t.manyOrNone(`select a.trial_id, a.trial_date, a.group_id, count(b.student_id) from group_nu_trials a
    JOIN student_nu_trials_results b
    ON a.trial_id = b.trial_id
    WHERE a.group_id = ${groupId}
    GROUP BY a.trial_id`))
    .then((nuTrialsData) => nuTrials = nuTrialsData)
    .then(() => t.query(`SELECT * from group_tests WHERE group_id = ${groupId}`))
    .then((testsData) => tests = testsData.map((test) => {
      test.subject_name = subjects.filter((subject) => {
        if (subject.id == test.subject_id) {
          return subject.name;
        }
      })[0].name;

      return test;
    }))
    .then(() => {
      t.tx((tt) => {
        const queries = tests.map((test) => tt.manyOrNone(`SELECT count(student_id), avg(points) from student_results WHERE test_id = 
          ${test.test_id} GROUP BY test_id`).then((results) => {
          test.result = results[0];
          test.percent = (test.result.avg / test.max_points) * 100;
        }));
        console.log(trials)
        return tt.batch(queries);
      })
      .then(() => res.status(200).render('./pages/groupPage', {
          tests,
          complexTests,
          group,
          students,
          subjects,
          reviews,
          trials,
          nuTrials,
          globalLink,
        }));
    })
    .catch((error) => {
      console.log('ERROR:', error);

      res.status(500).json({
        error,
      });
    });
  })




};

exports.addStudentToGroupPage = async (req, res, next) => {

  db.task(t => {

    const groupId = req.params.id;
    let group;

    return t.oneOrNone(`SELECT * from groups WHERE group_id = ${groupId}`)
    .then((groupData) => group = groupData)
    .then(() => t.manyOrNone(`SELECT a.student_id, a.name, a.class_number
     from students a
    FULL JOIN group_students b
    ON a.student_id = b.student_id
          WHERE 
        a.class_number = ${group.class_number} AND b.group_id <> ${groupId}
        OR b.group_id IS NULL AND a.class_number = ${group.class_number}`)
      .then((possibleNewStudents) => res.status(200).render('./updatePages/addStudent', {
        group,
        possibleNewStudents,
        globalLink,
      }))
    )
      .catch((error) => res.status(500).json({
        error
      }))

  });
};





exports.addStudentToGroup = async (req, res, next) => {
  const groupId = req.params.id;
  const { student } = req.body;
  console.log(student);
  db.oneOrNone(`SELECT * from students WHERE student_id = ${student}`)
    .then(({ student_id }) => db.query(`INSERT INTO group_students(student_id, group_id) VALUES(${student_id}, ${groupId})`))
    .then(() => res.redirect(`${globalLink}/groups/${groupId}/`));
};

exports.removeStudentFromGroupPage = async (req, res, next) => {
  const groupId = req.params.id;

  let group;
  let groupStudentsIds;
  db.one(`SELECT * from groups WHERE group_id = ${groupId}`).then((groupData) => {
    group = groupData;
    return db.manyOrNone(`SELECT * from group_students WHERE group_id = ${groupId}`);
  })
    .then((groupStudents) => {
      groupStudentsIds = groupStudents.map((student) => student.student_id);

      groupStudentsIds.reduce((acc, student_id) => {
        const newAcc = acc.then((contents) => db.manyOrNone(`SELECT * from students WHERE student_id = ${student_id}`)
          .then((data) => contents.concat(data)));
        return newAcc;
      }, Promise.resolve([]))
        .then((students) => {
          res.status(200).render('./removePages/removeStudent', {
            group,
            students,
            globalLink,
          });
        });
    });
};

exports.removeStudentFromGroup = async (req, res, next) => {
  const groupId = req.params.id;
  const studentId = req.body.student;

  db.any(`DELETE FROM group_students WHERE group_id = ${groupId} AND student_id = ${studentId}`)
    .then(() => res.redirect(`${globalLink}/groups/${groupId}/`));
};

// subjects

exports.addSubjectToGroupPage = async (req, res, next) => {
  const groupId = req.params.id;
  let group;
  let groupSubjectsIds;
  let allSubjects;
  db.one(`SELECT * FROM groups WHERE group_id = ${groupId}`)
    .then((groupData) => {
      group = groupData;
    }).then(() => db.manyOrNone('SELECT * from subjects'))
    .then((subjects) => {
      allSubjects = subjects;
    })
    .then(() => db.manyOrNone(`SELECT * from group_subjects WHERE group_id = ${groupId}`)
      .then((groupSubjects) => {
        groupSubjectsIds = groupSubjects.map((subject) => subject.subject_id);
      }))
    .then(() => allSubjects.filter((subject) => {
      if (groupSubjectsIds.includes(subject.id)) {
        return;
      }
      return subject;
    }))
    .then((availableSubjects) => res.status(200).render('./updatePages/addSubject', {
      group,
      availableSubjects,
      globalLink,
    }));
};

exports.addSubjectToGroup = async (req, res, next) => {
  const groupId = req.params.id;
  const subjectId = req.body.subject;
  let group;

  db.one(`SELECT * FROM groups WHERE group_id = ${groupId}`)
    .then((groupData) => {
      group = groupData;
    })
    .then(() => db.one(`SELECT * from subjects WHERE id = ${subjectId}`)
      .then((subject) => {
        console.log(subject);
        db.query(`INSERT INTO group_subjects(group_id, subject_id) VALUES (${groupId}, ${subject.id})`);
      }))
    .then(() => res.redirect(`${globalLink}/groups/${groupId}`));
};

exports.removeSubjectFromGroupPage = async (req, res, next) => {
  const groupId = req.params.id;

  let group;
  db.one(`SELECT * from groups WHERE group_id = ${groupId}`).then((groupData) => {
    group = groupData;
    return db.manyOrNone(`SELECT * from group_subjects a
        JOIN subjects b
        ON a.subject_id = b.id
        WHERE group_id = ${groupId}`);
  })
    .then((subjects) => res.status(200).render('./removePages/removeSubject', {
      group,
      subjects,
      globalLink,
    }));
};

exports.removeSubjectFromGroup = async (req, res, next) => {
  const groupId = req.params.id;
  const subjectId = req.body.subject;

  db.any(`DELETE FROM group_subjects WHERE group_id = ${groupId} AND subject_id = ${subjectId}`)
    .then(() => res.redirect(`${globalLink}/groups/${groupId}/`));
};



exports.removeGroupPage = async (req, res, next) => {

  db.task(t => {

    return t.manyOrNone(`SELECT * from groups where active`)
    .then((groups) => res.status(200).render('./removePages/removeGroup', {
      groups,
      globalLink,
    }))
  })


};


exports.removeGroup = async (req, res, next) => {

  db.task(t => {
    const groupId = req.body.group_id;
    return t.query(`UPDATE groups SET active = false WHERE group_id = ${groupId}`)
           .then(() => res.redirect(`${globalLink}/users/profile/`))

  })
  
}