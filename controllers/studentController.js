const { globalLink } = require('../app');
const db = require('../db');

exports.createStudentPage = async (req, res, next) => {
  res.status(200).render('./createPages/student', {
    globalLink,
  });
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

  db.task(t => {

    return t.query(`UPDATE students SET active = false WHERE student_id = ${studentForDeletion}`)
    .then(() => res.redirect(`${globalLink}/students/`))

  })
};

exports.reincarnateStudentPage = async (req, res, next) => {
  db.manyOrNone('SELECT * FROM students where active = false')
    .then((students) => {
      res.status(200).render('./updatePages/reincarnateStudentPage', {
        students,
        globalLink,
      });
    }).catch((err) => res.status(500).redirect(`${globalLink}/`));

};


exports.reincarnateStudent = async (req, res, next) => {

  const studentForReturn = req.body.student_id;
  console.log(studentForReturn);

  db.task(t => {
    return t.query(`UPDATE students SET active = true WHERE student_id = ${studentForReturn}`)
    .then(() => res.redirect(`${globalLink}/students/`))
    .catch((err) => {
      console.log(err)
      res.status(500).redirect(`${globalLink}/`)
    });
  })
}



exports.getStudent = async (req, res, next) => {

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
      where a.student_id = ${student_id}
      ORDER BY a.test_date ASC`))
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
        .render('./pages/studentPage', {
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
      console.log(error)
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


exports.removeSubjectFromStudentPage = async (req, res, next) => {


  db.task(t => {
    const studentId = req.params.id;

    return t.manyOrNone(`SELECT a.student_id, a.subject_id,
    b.name AS subject_name, c.name as student_name, c.class_number 
    from student_subjects a
    JOIN subjects b ON 
    a.subject_id = b.id
	  JOIN students c ON
	  a.student_id = c.student_id
	  where a.student_id = ${studentId}`)
    .then((subjects) => res.status(200).render('./removePages/removeStudentSubject', {
      globalLink,
      subjects,
      studentId,
    }))
    .catch((err) => {
      console.log(err)
      res.status(500).redirect(`${globalLink}/`)
    });
  });

};


exports.removeSubjectFromStudent = async (req, res, next) => {

  db.task(t => {
    const studentId = req.params.id;
    const subject = req.body.subject;
    return t.query(`DELETE FROM student_subjects WHERE student_id = ${studentId} AND subject_id = ${subject}`)
    .then(()=> res.status(200).redirect(`${globalLink}/students/${studentId}`))
    .catch((err) => {
      console.log(err)
      res.status(500).redirect(`${globalLink}/`)
    });
  });

};


exports.getAllStudentsAsync = async (req, res, next) => {
  const groupId = req.params.group_id;

  db.task(t => {

    return t.manyOrNone(`SELECT * from group_students a
    join students b
    on a.student_id = b.student_id
    where a.group_id = ${groupId}`)
    .then((students) => {
      // console.log(students);
      res.status(200).json({
      students,
      });
    })
    .catch((err) => {
      console.log(err)
      res.status(500).redirect(`${globalLink}/`)
    });
  });
};
