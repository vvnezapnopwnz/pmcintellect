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
      return student;
    });

    resolve(students);
  }).then((students) => db.task((t) => t.one(`INSERT INTO group_reviews(group_id, subject_id, posting_date)
            VALUES(${req.params.id}, ${req.body.subject}, '${req.body.reviewing_date}') RETURNING review_id`)).then(({ review_id }) => db.tx((tt) => {
    const queries = students.map((student) => {
      console.log(review_id);
      console.log(student);
      return tt.none(`INSERT INTO student_records(review_id, student_id, attendance, activity, homework)
            VALUES(${review_id}, ${student.id}, ${student.attendance}, ${student.activity}, ${student.homework})`);
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
    })).then(() => res.redirect(`${globalLink}/reviews/${reviewId}`))
  });

};