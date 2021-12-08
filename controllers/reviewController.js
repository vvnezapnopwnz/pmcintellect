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

const data = req.body

res.status(200).json({
    data
})





};