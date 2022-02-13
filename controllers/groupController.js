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

  return db.task(t => {

    const groupId = req.params.id;
    let group = {};

    return t.oneOrNone(`SELECT * from groups where group_id = ${groupId}`)
    .then((groupData) => {
      group.group_info = groupData;

      return t.manyOrNone(`select * from group_subjects a
      join subjects b
      on a.subject_id = b.id
      where a.group_id = ${groupId}`)
    })
    .then((group_subjects) => {
      group.subjects = group_subjects;

      return t.manyOrNone(`select a.group_id, d.name as subject_name,
      a.student_id, b.name as student_name
      from group_students a
      join students b
      on a.student_id = b.student_id
      join student_subjects c
      on b.student_id = c.student_id
      join subjects d
      on c.subject_id = d.id
      where a.group_id = ${groupId} and active = true`)
    }).then((group_students) => {
      group.students = group_students;

      group.group_students_by_subjects = group.subjects.map((subject) => {

       subject.subject_students = group.students.filter((student) => student.subject_name == subject.name);
       return subject;
      });
      return t.manyOrNone(`SELECT a.review_id,  a.posting_date, c.name,
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
      GROUP BY a.review_id, c.name`)
    })
    .then((group_reviews) => {
      group.reviews = group_reviews;

      return t.manyOrNone(`select distinct on(format) id, format, group_id from group_custom_tests
      where group_id = ${groupId}`);
    })
    .then((testFormatsData) => {

      return t.tx((tt) => {

        const queries = testFormatsData.map((format) => {
          return tt.manyOrNone(`select * from group_subjects a
          join subjects b on a.subject_id = b.id 
          where group_id = ${groupId}`)
          .then((subjects) => {
            format.subjects = subjects;
            return format;
          })
        })
        return tt.batch(queries);
      })
    })
    .then((formatsData) => {

      group.formats = formatsData;
      
      return t.tx((tt) => {

        const queries = group.formats.map((format) => {

          return format.subjects.map((subject) => {
            tt.manyOrNone(`select distinct a.format, a.id,
            b.test_date, b.theme, b.score_five, b.score_four,
            b.score_three
            from group_custom_tests a
                        join custom_tests_results b
                        on a.id = b.custom_test_id
                        where a.format = '${format.format}' 
                        and b.subject_id = ${subject.id}`)
            .then((testData) => {
              subject.tests = testData;
              return subject;
            });
          });
        });

        return tt.batch(queries);
      });
    })
    .then(() => {
      group.formats.map((format) => {
        return format.subjects.map((subject) => {
          return subject.tests.map((test) => {
            test.students = group.students.map((student) => student.student_name)
              .sort()
              .filter((v, i, a) => a.indexOf(v) === i)
              .map((student_name) => {
                return { name: student_name }
              });
          });
        });
      });
    })
    .then(() => {

        return t.tx((tt) => {
            const queries = group.formats.map((format) => {
              
              return format.subjects.map((subject) => {

                return subject.tests.map((test) => {
                  
                  return test.students.map((student) => tt.manyOrNone(
                    `select a.student_id, a.subject_id,
                    a.max_points, a.points from custom_tests_results a
                    join group_custom_tests b
                    on a.custom_test_id = b.id
                    join students c
                    on a.student_id = c.student_id
                    join subjects d
                    on a.subject_id = d.id
                    where a.custom_test_id = ${test.id}
                    and c.name = '${student.name}'
                    and a.subject_id = ${subject.subject_id}`)
                    .then((resultsData) => {
                      student.results = resultsData;
                      return student;
                    }))
                })
              })
            })

            return tt.batch(queries)
        })
    })
    .then(() => {
      unique_students = group.students
        .map((student) => student.student_name)
        .filter((v, i, a) => a.indexOf(v) === i);

      // res.status(200).json({
      //   formats: group.formats,
      // })

      res.status(200).render('./pages/groupPage', {
      unique_students,
      formats: group.formats,
      group_students_by_subjects: group.group_students_by_subjects,
      group: group.group_info,
      students: group.students,
      subjects: group.subjects,
      reviews: group.reviews,
      globalLink,
      })
    });
  })
  .catch((error) => {
    console.log('ERROR:', error);

    res.status(500).json({
      error,
    });
  });


};




exports.moveStudentPage = async (req, res, next) => {

  db.task((t) => {
    
    return t.manyOrNone(`SELECT * from groups where active = true`)
    .then((groups) => {
      return res.status(200).render('./pages/moveStudent', {
        groups,
        globalLink,
      })
    })
  })


};


exports.moveStudent = async (req, res, next) => {

  db.task((t) => {
    const groupFrom = req.body.group_from;
    const studentId = req.body.student_to_move;
    const groupTo = req.body.group_to;

    return t.query(`UPDATE group_students
    SET group_id = ${groupTo}
    WHERE student_id = ${studentId}
    AND group_id = ${groupFrom}`)
    .then(() =>  res.redirect(`${globalLink}/groups/${groupTo}/`))
  })
  .catch((err) => res.status(500).json({
    error: err.message,
    text: 'Возникла ошибка, обратитесь в технический отдел',
  }));


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