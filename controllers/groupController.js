const globalLink = require('./../app').globalLink;
const db = require('./../db');

exports.newGroupPage = async (req, res, next) => {



    res.status(200).render('./createPages/group');




};

exports.newGroup = async (req, res, next) => {
    

const newGroup = await Group.create(req.body);

  
    //   res.status(201).redirect(`/groups/${group.id}`);


    res.json({
        data: newGroup

    })

};



exports.getGroup = async (req, res, next) => {
    const groupId = req.params.id;
    let group;
    let groupStudentsIds;
    let students;
    let groupSubjectsIds;
    let subjects;
    let tests;

    db.one(`SELECT * from groups WHERE group_id = '${groupId}'`)
    .then((groupData) => group = groupData)
    .then(() => db.manyOrNone(`SELECT * from group_students WHERE group_id = '${groupId}'`))
    .then((groupStudentsData) => groupStudentsIds = groupStudentsData)
    .then(() =>  groupStudentsIds.reduce((acc, {student_id}) => {
            const newAcc = acc.then((contents) => 
                db.manyOrNone(`SELECT * from students WHERE student_id = '${student_id}'`)
                .then((data) => contents.concat(data)))
                console.log(group);
                console.log(globalLink)
                return newAcc;
            }, Promise.resolve([]))
            .then((thisStudents) => students = thisStudents))
    .then(() => 
        db.manyOrNone(`SELECT * from group_subjects WHERE group_id = ${groupId}`))
        .then((groupSubjectsData) => groupSubjectsIds = groupSubjectsData)
        .then(() => groupSubjectsIds.reduce((acc, {subject_id}) => {
            const newAcc = acc.then((contents) =>
            db.manyOrNone(`SELECT * from subjects WHERE id = ${subject_id}`)
            .then((data) => contents.concat(data)))
            return newAcc;
        }, Promise.resolve([]))
        .then((thisSubjects) => subjects = thisSubjects))
    .then(() => 
    db.query(`SELECT * from group_tests WHERE group_id = ${groupId}`))
    .then((testsData) => tests = testsData.map((test) => {
        test.subject_name = subjects.filter((subject) => {
            if(subject.id == test.subject_id) {
                return subject.name;
            } else {
                return;
            }
        })[0].name;

        return test;
    }))
    .then(() => {
        db.tx(t => {

            const queries = tests.map((test) => {

            return t.manyOrNone(`SELECT count(student_id), avg(points) from student_results WHERE test_id = 
            ${test.test_id} GROUP BY test_id`).then((results) => {
                test.result = results[0]
                test.percent = (test.result.avg / test.max_points) * 100;
            });
        });
        return t.batch(queries);

        }).then(() => res.status(200).render('./pages/groupPage',{
            tests,
            group,
            students,
            subjects,
            globalLink
        }))
    })

    // .then(() => db.tx(t => {
        
    //     const queries = tests.map((test) => {
    //         return t.manyOrNone(`SELECT * from student_results WHERE test_id = 
    //         ${test.test_id}`);
    //     });
    //     return t.batch(queries);
    // }).then((resultsData) => results = resultsData))
    // .then(() => {








    // })
    .catch(function (error) {
        console.log('ERROR:', error)
      
        res.status(500).json({
                error: error
            });
        });
};


// [
//     {
//       "test_id": 16,
//       "date": "2021-12-02T18:00:00.000Z",
//       "group_id": 1,
//       "subject_id": 3,
//       "format": "test",
//       "max_points": 15
//     }
//   ]

//students


exports.addStudentToGroupPage = async (req, res, next) => {
    const groupId = req.params.id;
    let group;
    let allAvailableStudents;
    db.one(`SELECT * from groups WHERE group_id = ${groupId}`)
        .then((groupData) => {
            const { class_number } = groupData;
            group = groupData;
            return db.manyOrNone(`SELECT * from students WHERE class_number = ${ class_number }`)
        })
        .then((availableStudents) => {
            allAvailableStudents = availableStudents;
            allAvailableStudents.reduce((acc, {student_id }) => {
                const newAcc = acc.then((contents) => 
                db.manyOrNone(`SELECT * from group_students WHERE group_id = ${groupId} AND student_id = ${student_id}`)
                    .then((data) => contents.concat(data))
                    );
                return newAcc;
            }, Promise.resolve([]))
        .then((thisGroupStudents) => {
            const ids = thisGroupStudents.map((student) => student.student_id);
            const possibleNewStudents = allAvailableStudents.filter((student) => {
    
                if(!ids.includes(student.student_id)) {
                    return student.student_id;
                } else {
                    return;
                }
            });
            res.status(200).render('./updatePages/addStudent',{
                group,
                possibleNewStudents,
                globalLink,
            });
        });
    });
};



exports.addStudentToGroup = async (req, res, next) => {
    const groupId = req.params.id;
    const { student } = req.body;
    console.log(student)
    db.oneOrNone(`SELECT * from students WHERE student_id = ${student}`)
    .then(({ student_id }) => db.query(`INSERT INTO group_students(student_id, group_id) VALUES(${student_id}, ${groupId})`))
    .then(() => res.redirect(`${globalLink}/groups/${groupId}/`));
};




exports.removeStudentFromGroupPage = async (req, res, next) => {
    const groupId = req.params.id;

    let  group;
    let groupStudentsIds;
    db.one(`SELECT * from groups WHERE group_id = ${groupId}`).then((groupData) => {
        group = groupData;
        return db.manyOrNone(`SELECT * from group_students WHERE group_id = ${groupId}`);
    })
    .then((groupStudents) => {
        groupStudentsIds = groupStudents.map((student) => student.student_id);
        console.log(groupStudentsIds);


        groupStudentsIds.reduce((acc, student_id ) => {
            const newAcc = acc.then((contents) => 
                db.manyOrNone(`SELECT * from students WHERE student_id = ${student_id}`)
                    .then((data) => contents.concat(data))
                );
            return newAcc;
        }, Promise.resolve([]))
        .then((students) => {
            console.log(students)
            res.status(200).render('./removePages/removeStudent', {
            group,
            students,
            globalLink,
            })
        });
    });

};

exports.removeStudentFromGroup = async (req, res, next) => {
    const groupId = req.params.id;
    const studentId = req.body.student;

    db.any(`DELETE FROM group_students WHERE group_id = ${groupId} AND student_id = ${studentId}`)
        .then(() => res.redirect(`${globalLink}/groups/${groupId}/`));

};


//subjects

exports.addSubjectToGroupPage = async (req, res, next) => {
    const groupId = req.params.id;
    let group;
    let groupSubjectsIds;
    let allSubjects;
    db.one(`SELECT * FROM groups WHERE group_id = ${groupId}`)
    .then((groupData) => {
        group = groupData;
    }).then(() => db.manyOrNone(`SELECT * from subjects`))
    .then((subjects) => {
        allSubjects = subjects;
    }).then(() => db.manyOrNone(`SELECT * from group_subjects WHERE group_id = ${groupId}`)
    .then((groupSubjects) => {

        groupSubjectsIds = groupSubjects.map((subject) => subject.subject_id);
        console.log(groupSubjectsIds)
    })
    ).then(() => 
        allSubjects.filter((subject) => {
            console.log(subject.id)
            if(groupSubjectsIds.includes(subject.id)) {
                return;
            }
            return subject;
        })
    ).then((availableSubjects) => res.status(200).render('./updatePages/addSubject', {
        group,
        availableSubjects,
        globalLink,
    }));

};



exports.addSubjectToGroup = async (req, res, next) => {
    const groupId = req.params.id;
    let subjectId = req.body.subject;
    let group;

    db.one(`SELECT * FROM groups WHERE group_id = ${groupId}`)
    .then((groupData) => {
        group = groupData;
    })
    .then(() => db.one(`SELECT * from subjects WHERE id = ${subjectId}`)
    .then((subject) => {
        console.log(subject)
        db.query(`INSERT INTO group_subjects(group_id, subject_id) VALUES (${groupId}, ${subject.id})`)
    }))
    .then(() => res.redirect(`${globalLink}/groups/${groupId}`));

};







exports.removeSubjectFromGroupPage = async (req, res, next) => {
    const groupId = req.params.id;

    let  group;
    let groupSubjectsIds;

    db.one(`SELECT * from groups WHERE group_id = ${groupId}`).then((groupData) => {
        group = groupData;
        return db.manyOrNone(`SELECT subject_id from group_subjects WHERE group_id = ${groupId}`);
    })
    .then((thisSubjectsIds) => {
        groupSubjectsIds = thisSubjectsIds;

        groupSubjectsIds.reduce((acc, {subject_id}) => {
            console.log(subject_id)
            const newAcc = acc.then((contents) => 
                db.any(`SELECT * from subjects WHERE id = ${subject_id}`)
                .then((subjects) => contents.concat(subjects))
            );
            return newAcc;
        }, Promise.resolve([]))
        .then((subjects) => res.status(200).render('./removePages/removeSubject', {
            group,
            subjects,
            globalLink,
        }));
    });


};

exports.removeSubjectFromGroup = async (req, res, next) => {

    const groupId = req.params.id;
    const subjectId = req.body.subject;

    db.any(`DELETE FROM group_subjects WHERE group_id = ${groupId} AND subject_id = ${subjectId}`)
        .then(() => res.redirect(`${globalLink}/groups/${groupId}/`));

};