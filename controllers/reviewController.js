const { globalLink } = require('../app');
const db = require('../db');

exports.addReviewPage = async (req, res, next) => {

  db.task(t => {
    const groupId = req.params.id;
    let group;
    const subjectId = req.params.subject_id;

    return t.oneOrNone(`SELECT * FROM groups WHERE group_id = ${groupId}`)
    .then((groupData) => group = groupData)
    .then(() => db.oneOrNone(`SELECT * from group_subjects a
    JOIN subjects b ON b.id = a.subject_id
    WHERE a.subject_id = ${subjectId} AND a.group_id = ${groupId}`)
      .then((subject) => {
        console.log(subject.name);
        db.manyOrNone(`SELECT b.student_id, c.id, b.name
        FROM student_subjects a
        JOIN students b
        ON a.student_id = b.student_id
        JOIN subjects c
        ON a.subject_id = c.id
        JOIN group_students d
        ON b.student_id = d.student_id
        WHERE c.id = ${subjectId} AND d.group_id = ${groupId} and b.active = true`)
          .then((students) => {
            res.status(200).render('./updatePages/addReview', {
              group,
              subject,
              globalLink,
              students,
            });
          });
      }));

  })

};

exports.addReview = async (req, res, next) => {
  
  new Promise((resolve, reject) => {

    const studentsData = [req.body.students].flat();


    const students = studentsData.map((student_id) => {
      const student = { id: Number(student_id) };
      student.attendance = req.body[`attendance_${student_id}`] ? req.body[`attendance_${student_id}`] : null;
      student.activity = req.body[`activity_${student_id}`] ? req.body[`activity_${student_id}`] : null;
      student.homework = req.body[`homework_${student_id}`] ? req.body[`homework_${student_id}`] : null;
      student.comment = req.body[`comment_${student_id}`] ? req.body[`comment_${student_id}`] : null;

      if(student.attendance == null && student.activity == null && student.homework == null) {
        return null;
      } else {
        return student;
      }
    }).filter((student) => student !== null)
    console.log(students)
    console.log(req.body) 
    resolve(students);
  }).then((students) => db.task((t) => t.one(`INSERT INTO group_reviews(group_id, subject_id, posting_date)
            VALUES(${req.params.id}, ${req.body.subject}, '${req.body.reviewing_date}') RETURNING review_id`)).then(({ review_id }) => db.tx((tt) => {
    const queries = students.map((student) => {
      return tt.none(`INSERT INTO student_records(review_id, student_id, attendance, activity, homework, comment)
            VALUES(${review_id}, ${student.id}, ${student.attendance}, ${student.activity}, ${student.homework}, ${student.comment == null ? null : `'${student.comment}'`})`);
    });
    return tt.batch(queries);
  })).then(() => res.redirect(`${globalLink}/groups/${req.params.id}`)));
};




exports.getReview = async (req, res, next) => {

  db.task(t => {
    const reviewId = req.params.id;

    return t.manyOrNone(`SELECT a.review_id, a.posting_date, a.group_id, d.name, e.name
      AS group_name, b.student_id,
      c.name AS subject_name, b.attendance, b.activity,
      b.homework
      FROM group_reviews a
      JOIN student_records b
      ON a.review_id = b.review_id
      JOIN subjects c
      ON a.subject_id = c.id
      JOIN students d
      ON b.student_id = d.student_id
      JOIN groups e
      ON a.group_id = e.group_id
      WHERE a.review_id = ${reviewId}`)
      .then((records) => res.status(200).render('./pages/reviewPage', {
        records,
        group: records[0],
        globalLink,
      }));

  })

};

exports.removeReviewPage = async (req, res, next) => {

  db.task(t=> {
    const groupId = req.params.id;
    return t.manyOrNone(`select distinct a.review_id, b.name as group_name, 
      a.posting_date,
      d.name as subject_name from group_reviews a
      JOIN groups b
      ON a.group_id = b.group_id
      JOIN student_records c
      ON a.review_id = c.review_id
      JOIN subjects d
      ON a.subject_id = d.id
      where a.group_id = ${groupId}`)
      .then((reviews) => {
        res.status(200).render('./removePages/removeReview', {
          reviews,
          globalLink,
          groupId,
        })
      });
  });
  
}




exports.removeReview = async (req, res, next) => {

  db.task(t=> {
    const reviewId = req.body.review;
    const groupId = req.params.id;
    return t.query(`delete from student_records where review_id = ${reviewId}`)
    .then(() => t.query(`delete from group_reviews where review_id = ${reviewId}`))
    .then(() => res.status(200).redirect(`${globalLink}/groups/${groupId}`))
  });

};

exports.updateReviewPage = async (req, res, next) => {

  db.task(t => {
    const reviewId = req.params.id;

    return t.manyOrNone(`SELECT a.review_id, a.posting_date, a.group_id, d.name, e.name
    AS group_name, b.student_id, a.subject_id,
    c.name AS subject_name, b.attendance, b.activity,
    b.homework
    FROM group_reviews a
    JOIN student_records b
    ON a.review_id = b.review_id
    JOIN subjects c
    ON a.subject_id = c.id
    JOIN students d
    ON b.student_id = d.student_id
    JOIN groups e
    ON a.group_id = e.group_id
    WHERE a.review_id = ${reviewId}`)
    .then((records) => {
      
      res.status(200).render('./updatePages/updateReview',{
      records,
      review: records[0],
      globalLink,
      })
    });
  });

};

exports.updateReview = async (req, res, next) => {

  db.task(t => {
    const reviewId = req.params.id;
    const subjectId = req.body.subject_id;
    const reviewDate = req.body.posting_date;
    const studentsData = [req.body.students].flat();

    const students = studentsData.map((student_id) => {
      const student = { id: Number(student_id) };
      student.attendance = req.body[`attendance_${student_id}`] ? req.body[`attendance_${student_id}`] : null;
      student.activity = req.body[`activity_${student_id}`] ? req.body[`activity_${student_id}`] : null;
      student.homework = req.body[`homework_${student_id}`] ? req.body[`homework_${student_id}`] : null; 
      return student;
    });

    return t.oneOrNone(`UPDATE group_reviews
    SET subject_id = ${subjectId}, posting_date = '${reviewDate}'
    WHERE review_id = ${reviewId}`)
    .then(() => db.tx(tt => {

      const queries = students.map((student) => {

        return tt.none(`UPDATE student_records
        SET attendance = ${student.attendance}, activity = ${student.activity},
        homework = ${student.homework} WHERE student_id = ${student.id} and review_id = ${reviewId}`);
      });

      return tt.batch(queries);
    })).then(() => res.redirect(`${globalLink}/reviews/${reviewId}`));
  });

};

exports.getAsyncReviews = async (req, res, next) => {

  db.task(t => {
    const month = req.params.month;
    const subjectId = req.params.subject_id;
    const groupId = req.params.group_id;

    const date = `${month}-01`;
    return t.manyOrNone(`select 
    a.review_id, a.group_id,
    a.subject_id, c.name as subject_name,
    a.posting_date, 
    count(b.attendance) filter (where b.attendance) as attendance_count,
    count(b.activity) filter (where b.activity) as activity_count,
	  count(b.homework) filter (where b.homework) as homework_count
    from group_reviews a
    join student_records b
    on a.review_id = b.review_id
    join subjects c
    on a.subject_id = c.id
    where a.group_id = ${groupId} and
    subject_id = ${subjectId}
    and
    posting_date > '${date}' and
    posting_date < '${date}':: date +  INTERVAL '1 month'
    GROUP BY a.review_id, c.name
    ORDER BY a.posting_date DESC
    `)
    .then((reviews) => {
      res.status(200).json(reviews);
    });

  });

};

exports.getStudentAsyncReviews = async (req, res, next) => {

  db.task(t => {

    const start = req.params.start;
    const end = req.params.end;
    const studentId = req.params.student_id;
    const subjectId = req.params.subject_id;

    return t.manyOrNone(`select 
    a.review_id, a.subject_id, 
	  c.name as subject_name,
    a.posting_date, b.student_id,
    b.attendance,
    b.activity,
	  b.homework,
    b.comment
    from group_reviews a
    join student_records b
    on a.review_id = b.review_id
    join subjects c
    on a.subject_id = c.id
    where b.student_id = ${studentId}
    ${subjectId == 'no_subject' ? '' : `and subject_id = ${subjectId}`}
	  and posting_date >= '${start}' and
    posting_date <= '${end}'
    GROUP BY a.review_id, c.name, b.student_id,
	  b.attendance, b.activity, b.homework, b.comment
    ORDER BY a.posting_date DESC`)
    .then((reviews) => {
      res.status(200).json(reviews);
    });

  });

};


exports.getDashboardOverviewAsyncStudentVisits = async (req, res, next) => {

  db.task(t => {

    const startDate = req.params.start;
    const endDate = req.params.end;

    return t.one(`select count(distinct c.name)
    from student_records a
    join group_reviews b
    on a.review_id = b.review_id
    join students c
    on a.student_id = c.student_id
    where posting_date >= '${startDate}'
    and posting_date <= '${endDate}'`)
    .then((data) => res.status(200).json(data))
    .catch((error) => res.redirect(`${globalLink}`))

  });

};


exports.getReviewsCountAsync = async (req, res, next) => {

  db.task(t => {

    const startDate = req.params.start;
    const endDate = req.params.end;
    const groupId = req.params.group_id
    let subjects;

    return t.manyOrNone(`select * from groups a
    join group_subjects b
    on a.group_id = b.group_id
    join subjects c
    on b.subject_id = c.id
    where a.group_id = ${groupId}`)
    .then((subjectsData) => {
      subjects = subjectsData

      return Promise.all(subjectsData.map(async (subject) => {

          return t.manyOrNone(`select * from group_reviews *
          where group_id = ${groupId} and subject_id = ${subject.subject_id}
          and posting_date >= '${startDate}'
          and posting_date <= '${endDate}'`)
          .then((data) => subject.reviews = data)
      }))
    })
    .then(() => res.status(200).json(subjects))

  })

}