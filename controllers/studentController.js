const Student = require('./../models/studentModel');
const Test = require('./../models/testModel');

const globalLink = 'http://localhost:3000';

exports.createStudentPage = async (req, res, next) => {
    res.status(200).render('./createPages/student', {
      globalLink,
    });
};

exports.createStudent = async (req, res, next) => {
    console.log(req.body)

   await Student.create(req.body).then(() => {
    res.status(201).redirect(`${globalLink}/users/profile`);
   });
};


exports.getStudent = async (req, res, next) => {
    console.log(req.params)
    const StudentId = req.params.id
    let name; 
    let surname; 
    const studentInfo = await Student.findById(StudentId)

  await Student.findById(StudentId)
    .then((data) => {
      name = data.name;
      surname = data.surname;
      console.log(name)
      console.log(surname)
  })
    .then( async () => {
      const studentTests = await Test.find({
        studentGrades: { $elemMatch: { studentName: `${surname} ${name}` } }
      })
      return studentTests
    })
    .then((tests) => {
      const thisStudentResults = tests.map((test) => {
        const studentGroupName = test.groupName;
        const studentDate = test.date;
        const studentSubject = test.subject;
        const studentQuestionsQuantity = test.questionsQuantity;
        const studentTestFormat = test.format;
        const studentGrades = test.studentGrades.filter((studentGrade) => studentGrade.studentName == `${surname} ${name}`);
        const studentName = studentGrades[0].studentName;
        const studentGrade = studentGrades[0].studentGrade;
        const percentOfMaximum = studentGrade / studentQuestionsQuantity * 100;

        const studentTest = {
          studentGroupName,
          studentDate,
          studentSubject,
          studentTestFormat,
          studentQuestionsQuantity,
          studentName,
          studentGrade,
          percentOfMaximum
        };

        return studentTest;
      });
      console.log(thisStudentResults);
      res.status(201).render('./pages/studentPage', {
        studentInfo,
        thisStudentResults,
        globalLink,
      });
    });
};


exports.getAll = async (req, res, next) => {

const allStudents = await Student.find({});

  res.status(201).render('./pages/studentsAll', {
    allStudents,
    globalLink,
  })

};

