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
    let reviews;

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
    WHERE a.group_id = 7
    GROUP BY a.review_id, c.name`))
    .then((reviewsData) => reviews = reviewsData)
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
        return tt.batch(queries);
      })
        .then(() => res.status(200).render('./pages/groupPage', {
          tests,
          group,
          students,
          subjects,
          reviews,
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
    .then(() => t.manyOrNone(`SELECT * from group_students a
      JOIN students b
      ON a.student_id = b.student_id
      WHERE a.group_id <> ${groupId} AND class_number = ${group.class_number}`)
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
      console.log(groupStudentsIds);

      groupStudentsIds.reduce((acc, student_id) => {
        const newAcc = acc.then((contents) => db.manyOrNone(`SELECT * from students WHERE student_id = ${student_id}`)
          .then((data) => contents.concat(data)));
        return newAcc;
      }, Promise.resolve([]))
        .then((students) => {
          console.log(students);
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
      console.log(subject.id);
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