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
      // performance.mark('start')
      return t.manyOrNone(`select * from group_subjects a
      join subjects b
      on a.subject_id = b.id
      where a.group_id = ${groupId}`)
    })
    .then(async (group_subjects) => {
      
      group.subjects = await Promise.all(group_subjects.map((subject) => {

        return t.manyOrNone(`select *, b.name as student_name from group_students a
        join students b
        on a.student_id = b.student_id
        join student_subjects c
        on b.student_id = c.student_id 
        join subjects d
        on d.id = c.subject_id
        where a.group_id = ${groupId} and c.subject_id = ${subject.subject_id} and b.active = true`)
        .then((subject_students) => 
        ({
           name: subject.name, subject_id: subject.id, students: subject_students 
          })
          );
      }));
    })
    .then(() => {
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
      performance.mark('begin tests');
      return t.manyOrNone(`select distinct on(format) id, format, group_id from group_custom_tests
      where group_id = ${groupId}`);
    })
    .then(async (formats) => {

      group.formats = await Promise.all(formats.map((format) => {

        return t.manyOrNone(`select distinct b.subject_id, c.name as subject_name
        from group_custom_tests a
        join custom_tests_results b
        on a.id = custom_test_id
        join subjects c
        on b.subject_id = c.id
        where a.group_id = ${groupId} and a.format = '${format.format}'`)
        .then( async (subjects) => ({
          format: format.format, format_id: format.id, subjects: await Promise.all(subjects.map(async (subject) => {

            return t.manyOrNone(`SELECT *
            FROM (
            SELECT  a.format, b.subject_id,
            b.test_date, b.student_id, b.theme,
            c.name as student_name,
            b.max_points, b.points, b.score_five, b.score_four, b.score_three,
            MAX(test_date) OVER (PARTITION BY a.format)
            as last_date,
              CASE
              WHEN ROUND(cast(b.points as decimal) / b.max_points * 100) > score_five THEN
                5 
              WHEN ROUND(cast(b.points as decimal) / b.max_points * 100) < score_five
                AND ROUND(cast(b.points as decimal) / b.max_points * 100) > score_four THEN
                4
              WHEN ROUND(cast(b.points as decimal) / b.max_points * 100) < score_four
                AND ROUND(cast(b.points as decimal) / b.max_points * 100) > score_three THEN
              3
                ELSE
              2
                END
              AS grade,
              ROUND(cast(b.points as decimal) / b.max_points * 100) as percents
            FROM group_custom_tests a
            join custom_tests_results b
            on a.id = b.custom_test_id
            join students c
              on b.student_id = c.student_id
            where group_id = ${groupId}
            and subject_id = ${subject.subject_id}
            and format = '${format.format}'
              GROUP BY a.format, b.subject_id, b.test_date, b.student_id, c.name, b.points, b.max_points,
              b.score_five, b.score_four, b.score_three, b.theme
            ) x
            WHERE test_date = last_date
            `)
            .then((latest_test_results) => ({subject, latest_test_results}))
          }))
        })
        );
      }));
    })
    .then(() => {

      return t.manyOrNone(`select * from group_students
      where group_id = ${groupId}`)
      .then((group_students) => {
        res.status(200).render('./pages/groupPage', {
          group: group.group_info,
          subjects: group.subjects,
          reviews: group.reviews,
          formats: group.formats,
          globalLink,
          group_students,
          });
      });
    });
  })
  .catch((error) => {
    console.log('ERROR:', error);

    res.status(500).json({
      error,
    });
  });


}


exports.getFormatTestsPage = async (req, res) => {

  db.task(t => {

    const groupId = req.params.id;
    const formatId = req.params.format_id;
    const subjectId = req.params.subject_id;
    let formatName;
    let studentsNames;
    let subjectName;
    let groupName;
    let dates;
    let graphData;

    return t.oneOrNone(`select * from subjects where
    id = ${subjectId}`)
    .then((subjectData) => {
      subjectName = subjectData.name;

      return t.oneOrNone(`select distinct a.format, 
      d.name as group_name
      from 
      group_custom_tests a
      join groups d
      on d.group_id = a.group_id
      where a.group_id = ${groupId}
      and a.id = ${formatId} LIMIT 1
      `)
      .then(({format, group_name }) =>  {
        formatName = format;
        groupName = group_name;

        return t.manyOrNone(`select distinct b.name, b.student_id from
          custom_tests_results a
          join students b
          on a.student_id = b.student_id
          join group_custom_tests c
          on a.custom_test_id = c.id
          where c.group_id = ${groupId} and c.format = '${formatName}'
          and a.subject_id = ${subjectId}
          GROUP BY a.test_date, a.id, b.student_id, c.id`)
      })
      .then((studentsNamesData) => {
        studentsNames = studentsNamesData;

      })
      .then(() => t.manyOrNone(`select distinct a.test_date,
      max_points from custom_tests_results a
      join students b
      on a.student_id = b.student_id
      join group_custom_tests c
      on a.custom_test_id = c.id
      where c.group_id = ${groupId} and c.format = '${formatName}'
      and a.subject_id = ${subjectId}
      GROUP BY a.test_date, a.id, b.student_id, c.id`))
      .then(async (datesData) => {
        dates = datesData;

          return t.manyOrNone(`select a.test_date, a.custom_test_id, a.subject_id,
          AVG(CASE 
          WHEN ROUND(cast(a.points as decimal) / a.max_points * 100) > a.score_five THEN 5
          WHEN ROUND(cast(a.points as decimal) / a.max_points * 100) > a.score_four 
          AND ROUND(cast(a.points as decimal) / a.max_points * 100) < a.score_five THEN 4
          WHEN ROUND(cast(a.points as decimal) / a.max_points * 100) > a.score_three
          AND ROUND(cast(a.points as decimal) / a.max_points * 100) < a.score_four THEN 3
          WHEN ROUND(cast(a.points as decimal) / a.max_points * 100) < a.score_three THEN 2
		      ELSE null
          END)
          AS average_grade
          from custom_tests_results a
          join group_custom_tests b
          on a.custom_test_id = b.id
          where b.format = '${formatName}'
          and a.subject_id = ${subjectId}
          and b.group_id = ${groupId}
          GROUP BY a.test_date, a.custom_test_id, a.subject_id`)
      })
      .then((graphData) => {
        
        return t.manyOrNone(`select distinct a.test_date,
        COALESCE(
          sum(
            CASE WHEN ROUND(cast(a.points as decimal) / a.max_points * 100) > a.score_five
            THEN 1 ELSE 0 END),0) AS five_count,
        COALESCE(
          sum(
            CASE WHEN ROUND(cast(a.points as decimal) / a.max_points * 100) > a.score_four
            AND ROUND(cast(a.points as decimal) / a.max_points * 100) < a.score_five
            THEN 1 ELSE 0 END),0) AS four_count,
        COALESCE(
          sum(
            CASE WHEN ROUND(cast(a.points as decimal) / a.max_points * 100) > a.score_three
            AND ROUND(cast(a.points as decimal) / a.max_points * 100) < a.score_four
            THEN 1 ELSE 0 END),0) AS three_count,	
            COALESCE(
          sum(
            CASE WHEN ROUND(cast(a.points as decimal) / a.max_points * 100) < a.score_three
            THEN 1 ELSE 0 END),0) AS two_count
         from custom_tests_results a
         join group_custom_tests b
         on a.custom_test_id = b.id
         where b.format = '${formatName}'
         and a.subject_id = ${subjectId}
         and b.group_id = ${groupId}
         GROUP BY a.test_date`)
        .then((grades) => res.status(200).render('./pages/formatResults', {
          studentsNames,
          dates,
          globalLink,
          formatId,
          subjectId,
          groupId,
          formatName,
          groupName,
          graphData,
          grades,
          subjectName
        })
        );
      })
      .catch((err) => {
        console.log(err)
        res.redirect(`${globalLink}/groups/${groupId}`)
      });
    })
  });
};

exports.asyncGetFormatResults = async (req, res, next) => {

db.task(t => {

  const formatId = req.params.format_id;
  const subjectId = req.params.subject_id;
  const date = req.params.date;
  const studentId = req.params.student_id;
  const dateToSQLFormat = date.split('.').reverse().join('-');
  console.log(dateToSQLFormat);

  return t.query(`select points from custom_tests_results a
  where a.subject_id = ${subjectId} and student_id = ${studentId}
  and test_date::date = '${dateToSQLFormat}'`)
  .then((results) => {
    res.status(200).json({
     results
      })
    })
  })
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


exports.asyncSearch = async (req, res, next) => {

  db.task(t => {
    const comingRequestUrl = decodeURI(`${globalLink}/groups${req.url}`);
    const urlToParse = new URL(comingRequestUrl)
    const classNumberParam = urlToParse.searchParams.get("class_number");
    const nameParam = urlToParse.searchParams.get("group_name");
    const branchParam = urlToParse.searchParams.get("branch");
    const langParam = urlToParse.searchParams.get("lang");
    const activeParam = urlToParse.searchParams.get("active");

    return t.manyOrNone(`select * from groups 
    where name LIKE '%${nameParam}%' ${classNumberParam == '' ? '' : `and class_number = ${classNumberParam}`} ${ langParam == 'Язык обучения' ? '' : `and language = '${langParam}'`} ${ branchParam == 'Филиал' ? '' : `and branch = '${branchParam}'` } ${activeParam == 'В работе?' ? '' : `and active = '${activeParam == 'Активна' ? true : false }'` } `)
    .then((searchResults) => {

      res.status(200).json({
        searchResults,
      });
    })
  });
};



exports.updateGroupPage = async (req, res, next) => {

  db.manyOrNone(`select a.group_id,
  a.name as group_name, a.class_number,
  a.branch, a.language, a.active, count(*) as group_students_count
  from groups a
  join group_students b
  on a.group_id = b.group_id
  where a.active = true
  GROUP BY a.group_id`)
    .then((groups) => {
      res.status(200).render('./updatePages/updateGroupPage', {
        groups,
        globalLink,
        user: res.locals.user,
      });
    })
    .catch((error) => {
      console.log('ERROR:', error);
    });

}


exports.updateGroup = async (req, res, next) => {

  db.task(t => {

    const groupId = req.body.chosen_group_id;
    const groupName = req.body.chosen_group_name;
    const groupClassNumber = req.body.chosen_group_class_number;
    const groupBranch = req.body.chosen_group_branch_select;
    const groupLanguage = req.body.chosen_group_lang_select;
    const groupStatus = req.body.chosen_group_active_select;

    return t.query(`UPDATE groups
    SET name = '${groupName}',
    class_number = ${groupClassNumber},
    branch = '${groupBranch}',
    language = '${groupLanguage}',
    active = ${groupStatus == 'Активна'? true : false}
    WHERE group_id = ${groupId}`)
    .then(() => res.redirect(`${globalLink}/groups/update`))
  })

}

exports.asyncGetGroupInfo = async (req, res, next) => {

  db.task(t => {

    const groupId = req.params.id;

    return t.oneOrNone(`select * from groups where group_id = ${groupId}`)
    .then((groupData) => {
      res.status(200).json({groupData});
    })

  });

};