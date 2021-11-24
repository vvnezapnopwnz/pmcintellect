const Group = require('./../models/groupModel');
const Student = require('./../models/studentModel');


exports.newGroupPage = async (req, res, next) => {



    res.status(200).render('./createPages/group');




};

exports.newGroup = async (req, res, next) => {
    

const newGroup = await Group.create(req.body);

const group = await Group.findOneById(newGroup.id)
  
    //   res.status(201).redirect(`/groups/${group.id}`);


    res.json({
        data: req.body,

    })

};


exports.getGroup = async (req, res, next) => {
    console.log(req.params)
    const groupId = req.params.id

    const group = await Group.findById(groupId);
// const newGroup = await Group.create(req.body);
    // const tests = await Test.find({ groupName: group.name });
    // console.log(tests)
    const groupStudents = await Student.find({  })



    res.status(201).render('./pages/groupPage',{
        group,
        // tests
    });
};


exports.updateGroup = async (req, res, next) => {
    const groupId = req.params.id

    const group = await Group.findById(groupId);
    const studentsIDs = await group.students.map( async (studentID) => {

        const student = await Student.findById(studentID);
        return `${student}`;

    });

    console.Console(studentsIDs)
    res.status(201).render('./updatePages/group',{
        group,
        studentsIDs,
        // tests
    });



}