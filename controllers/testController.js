const globalLink = require('./../app').globalLink;
const db = require('./../db');


exports.addTestPage = async (req, res, next) => {
    const groupId = req.params.id;
    let group;
    let students;
    let subjects;

    db.one(`SELECT * from groups WHERE group_id = ${groupId}`)
    .then((groupData) => group = groupData)
    .then(() => db.manyOrNone(`SELECT * from group_students WHERE group_id = ${groupId}`))
    .then((thisGroupStudentsIds) => thisGroupStudentsIds.reduce((acc, {student_id}) => {
        const newAcc = acc.then((contents) => 
        db.one(`SELECT * from students WHERE student_id = ${student_id}`)
        .then((students) => contents.concat(students))
        );
        return newAcc;
    }, Promise.resolve([]))
    .then((studentsData) => students = studentsData))
    .then(() => db.manyOrNone(`SELECT * from group_subjects WHERE group_id = ${groupId}`))
    .then((thisGroupSubjects) => thisGroupSubjects.reduce((acc, {subject_id}) => {
        const newAcc = acc.then((contents) =>
        db.one(`SELECT * from subjects WHERE id = ${subject_id}`)
        .then((subjects) => contents.concat(subjects))
        );
        return newAcc;
    }, Promise.resolve([]))
    .then((subjectsData) => subjects = subjectsData))
    .then(() => res.status(200).render('updatePages/addTest',{
        group,
        students,
        subjects,
        globalLink,
    }))

};

exports.addTest = async (req, res, next) => {
    const groupId = req.params.id;
    const date = req.body.testing_date;
    const subject = req.body.subject;
    const testData = req.body;
    const studentsIds = [testData.students].flat();
    const studentsPoints = [testData.student_points].flat();
    const maxPoints = testData.max_points;
    const format = testData.testing_format;

    const studentsTests = studentsIds.map((studentId, index) => {
        const studentTest = {};
        studentTest.testingDate = date;
        studentTest.studentId = Number(studentId);
        studentTest.studentPoints = Number(studentsPoints[index]);
        studentTest.maxPoints = testData.max_points;
        studentTest.testFormat = testData.testing_format;
        studentTest.testSubject = subject;
        return studentTest;
    });

    db.query(`INSERT INTO group_tests(date, group_id, subject_id, format, max_points)
        VALUES('${date}', ${groupId}, '${subject}', '${format}', ${maxPoints}) RETURNING test_id`)
        .then((returning_id) => {
            db.tx(t => {
                const testId = returning_id[0].test_id;
                const queries = studentsTests.map( test => {
                    return t.none(`INSERT INTO student_results(test_id, student_id, points)
                        VALUES(${testId}, ${test.studentId}, ${test.studentPoints})`);
                });
                return t.batch(queries);
            })
            .then( () => res.redirect(`${globalLink}/groups/${groupId}`));
        });

};



exports.removeTestPage = async (req, res, next) => {
    const groupId = req.params.id;
    let tests;

    db.manyOrNone(`SELECT * from group_tests WHERE group_id = ${groupId}`)
    .then((testsData) => tests = testsData)
    .then(() => {

        db.tx(t => {
            const queries = tests.map( test => {
                return t.manyOrNone(`SELECT * from subjects WHERE id = ${test.subject_id}`)
                .then((subjectData) => test.subjectName = subjectData[0].name);
            });
            return t.batch(queries);
        })
        .then(() => db.oneOrNone(`SELECT * from groups WHERE group_id = ${groupId}`))
        .then((group) => res.status(200).render('./removePages/removeTest', {
            globalLink,
            tests,
            group,
        }));
    });

};





exports.removeTest = async (req, res, next) => {
    const groupId = req.params.id;
    test = req.body.test;

    db.query(`DELETE FROM student_results WHERE test_id = ${test}`)
    .then(() => db.query(`DELETE FROM group_tests WHERE test_id = ${test}`))
    .then(() => res.redirect(`${globalLink}/groups/${groupId}`))
    .catch((err) => res.status(500).send(err))
};