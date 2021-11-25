const Group = require('./../models/groupModel');
const Student = require('./../models/studentModel');
const Test = require('./../models/testModel');


const globalLink = 'https://pmcintellect.herokuapp.com';

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
    console.log(req.params)
    const groupId = req.params.id

    const group = await Group.findById(groupId)
    const groupName = await Group.findById(groupId, function(err, obj) {                      
        return obj.name  // 1234          
    })


    const groupTests = await Test.find({ groupName: groupName.name })
    console.log(groupName.name);
    

    res.status(201).render('./pages/groupPage',{
        group,
        groupTests,
        globalLink,
    });
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
        }
    ,
        { upsert:true } ,function(err){
        if(err){
                console.log(err);
        }else{
                console.log("Successfully added");
        }
});


    // .map( async (student) => {
    //     const studentName = student.split(' ')[1];
    //     const studentSurname = student.split(' ')[0];

    //     findedStudentByName = await Student
    //         .find({ name: studentName, surname: studentSurname });

    //     return findedStudentByName;
    // })

    res.status(201).json({

        data: group,
        studentToGroup
    })
};
