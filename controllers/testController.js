const Group = require('./../models/groupModel');
const Student = require('./../models/studentModel');
const Test = require('./../models/testModel');
const globalLink = require('./../app').globalLink;

exports.addTestPage = async (req, res, next) => {
    const groupId = req.params.id

    const group = await Group.findById(groupId);

    // const availableStudents = await Student.find({classNumber: group.classNumber });

    res.status(200).render('./updatePages/addTest', {
        group,
        globalLink,
    });
};

exports.addTest = async (req, res, next) => {
    const groupId = req.params.id

    const date = req.body.date;
    const groupName = req.body.name;
    const subject = req.body.subject;
    const format = req.body.format;
    const questionsQuantity = req.body.questionsQuantity;
    const data = req.body;
    const grades = data.grades;
    const studentNames = data.studentNames
    let averageGrade = 0;

    let counter = 0;
    const gradesArr = studentNames.map((studentName) => {
        averageGrade += Number(grades[counter]);

        const student =  {
        };

        student.studentName = studentName
        student.studentGrade = Number(grades[counter]);
        counter++;

        return student;
    });
    
    averageGrade = averageGrade / grades.length;

    const newTest = await Test.create({
        date: date,
        groupName: groupName,
        subject: subject,
        format: format,
        questionsQuantity: questionsQuantity,
        studentGrades: gradesArr,
        averageGrade: averageGrade,
    })
    console.log(newTest)

    res.status(200).redirect(`${globalLink}/groups/${groupId}/`)
};


exports.getTest = async (req, res, next) => {



    const testId = req.params.id;

    const thisTestInfo = await Test.findById(testId)

    const groupId = await Group.findOne({ name: thisTestInfo.groupName })
        .then((groupData) => groupData._id);

    await Test.findById(testId)
        .then((testData) => {
            const questionsQuantity = testData.questionsQuantity;

            const allGradesInfo = testData.studentGrades.map((gradeInfo) => {

                const studentName = gradeInfo.studentName;

                const studentGrade = gradeInfo.studentGrade;

                const percentOfMaximum = Math.round(studentGrade / questionsQuantity * 100);

                const fullInfo = {
                    studentGrade,
                    studentName,
                    percentOfMaximum,
                };

                return fullInfo;

            });

            return allGradesInfo;

        }).then((allGradesInfo) => {

            res.status(201).render('./pages/testPage', {
                groupId,
                thisTestInfo,
                allGradesInfo,
                globalLink,
            });
        });

};
