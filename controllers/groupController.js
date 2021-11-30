const Group = require('./../models/groupModel');
const Student = require('./../models/studentModel');
const Test = require('./../models/testModel');
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
    let group_students_ids;
    const initPromise = Promise.resolve([]);

    db.one(`SELECT * from groups WHERE group_id = '${groupId}'`)
    .then((groupData) => group = groupData)
    .then(() => db.manyOrNone(`SELECT * from group_students WHERE group_id = '${groupId}'`))
    .then((group_studentsData) => group_students_ids = group_studentsData)
    .then(() =>  group_students_ids.reduce((acc, {student_id}) => {
            const newAcc = acc.then((contents) => 
                db.manyOrNone(`SELECT * from students WHERE student_id = '${student_id}'`)
                .then((data) => contents.concat(data)))
                console.log(group);
                console.log(globalLink)
                return newAcc;
            }, initPromise)
            .then((students) => res.status(201)
                .render('./pages/groupPage', {
                    group,
                    students,
                    globalLink,
                })
            )
    )
    .catch(function (error) {
        console.log('ERROR:', error)
      
        res.status(500).json({
                error: error
            });
        });

        












    // const group = await Group.findById(groupId);

    // await Test.find({ groupName: group.name })
    //     .then((tests) => tests.map(({_doc}) => {
    //         const averagePercent = _doc.averageGrade / _doc.questionsQuantity * 100
    //         const _docWithPercent = { averagePercent, ..._doc };
    //         return _docWithPercent;
    //     }))
    //     .then((testData) => {
    //         res.status(201).render('./pages/groupPage', {
    //             group,
    //             testData,
    //             globalLink,
    //         });
    //     });
};


exports.addStudentPage = async (req, res, next) => {
    const groupId = req.params.id

    const group = await Group.findById(groupId);

    const availableStudents = await Student.find({classNumber: group.classNumber });

    res.status(201).render('./updatePages/addStudent',{
        group,
        availableStudents,
        globalLink,
        // tests
    });
};

exports.addStudent = async (req, res, next) => {
    const groupId = req.params.id
    const group = await Group.findById(groupId);

    const studentToGroup = req.body.students;

    Group.updateOne({ _id: groupId },
        {
            $push: {
                students: { $each: studentToGroup }
            }
        },
        { 
            upsert: true 
        } , function (err) {
                if(err) {
                    console.log(err);
                }else{
                    console.log("Successfully added");
        }
        }).then(() => res
        .status(201)
        .redirect(`${globalLink}/groups/${groupId}`))
};
