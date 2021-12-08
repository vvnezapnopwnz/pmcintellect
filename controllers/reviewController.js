const globalLink = require('./../app').globalLink;
const db = require('./../db');



exports.addReviewPage = async (req, res, next) => {
    const groupId = req.params.id;
    let group;

    db.one(`SELECT * FROM groups WHERE group_id = ${groupId}`)
    .then((groupData) => group = groupData)
    .then(() => db.manyOrNone(`SELECT * from group_subjects a
    JOIN subjects b ON b.id = a.subject_id
    WHERE group_id = ${groupId}`)
    .then((subjects) => {
        db.manyOrNone(`SELECT * FROM group_students a
        JOIN students b
        ON a.student_id = b.student_id WHERE group_id = ${groupId}`)
        .then((students) => {
            res.status(200).render('./updatePages/addReview', {
                group,
                subjects,
                globalLink,
                students
            })
        })
    })
);

};



exports.addReview = async (req, res, next) => {

    new Promise ((resolve, reject) => {
        console.log(req.params.id)
        console.log(req.body.subject)
        console.log(req.body.date)

        const students = req.body.students.map((student_id) => {

            const student = { id: Number(student_id) };
            student.attendance = req.body[`attendance_${student_id}`]
            student.activity = req.body[`activity_${student_id}`]
            student.homework = req.body[`homework_${student_id}`]
            return student;
         });

        resolve(students)

    }).then((students) => db.task(t => {
        
        return t.one(`INSERT INTO group_reviews(group_id, subject_id, posting_date)
            VALUES(${req.params.id}, ${req.body.subject}, '${req.body.reviewing_date}') RETURNING review_id`)
    }).then(({ review_id }) => db.tx(tt => {
        const queries = students.map((student) => {
            console.log(review_id)
            console.log(student)
            return tt.none(`INSERT INTO student_records(review_id, student_id, attendance, activity, homework)
            VALUES(${review_id}, ${student.id}, ${student.attendance}, ${student.activity}, ${student.homework})`)
        });
        return tt.batch(queries);
    })
    ).then(() => 
        res.redirect(`${globalLink}/groups/${req.params.id}`)));
};