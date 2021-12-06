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
    .then((subjects) => res.status(200).json( {
        group,
        subjects,
        globalLink
    })));

}