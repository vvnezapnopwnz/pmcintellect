const Student = require('./../models/studentModel');
const Test = require('./../models/testModel');
const globalLink = require('./../app').globalLink;
const db = require('./../db');


exports.createStudentPage = async (req, res, next) => {

    res.status(200).render('./createPages/student', {
      globalLink,
    });
};

exports.createStudent = async (req, res, next) => {
  
  const { name, class_number }= req.body
  console.log(name)

  // const cs = new pgp.helpers.ColumnSet(['name', 'class_number'], {table: 'students'});
  // const query = pgp.helpers.insert({name, class_number}, cs)+ ' RETURNING id';     
  // const response = await db.one(query);
  // response.then((data) => {
  //   res.status(200).json({
  //     data
  //   })
  // })

    db.one(`INSERT INTO students(name, class_number) VALUES('${name}', ${class_number})`+ ' RETURNING student_id')
      .then( (student_id) => {
       return db.one(`SELECT * from students WHERE student_id = ${student_id}`)
      })
      .then((data) => res.status(200).json({data}))
    
    
    
    .catch( (err) => {
      res.status(500).json({
        err
      })
    })




  //  await Student.create(req.body).then(() => {
  //   res.status(201).redirect(`${globalLink}/users/profile`);
  //  });
};




exports.getStudent = async (req, res, next) => {
    console.log(req.params)
    const studentId = req.params.id
  let student;


    db.one(`SELECT * from students WHERE student_id = ${studentId}`)
  .then(function (data) {
    student = data;
    console.log(data);
    res.status(200).render('./pages/studentPage', {
      student,
      globalLink
    })
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  });



    // let name; 
    // let surname; 
    // const studentInfo = await Student.findById(StudentId)
    // await Student.findById(StudentId)
  //   .then((data) => {
  //     name = data.name;
  //     surname = data.surname;
  //     console.log(name)
  //     console.log(surname)
  // })
  //   .then( async () => {
  //     const studentTests = await Test.find({
  //       studentGrades: { $elemMatch: { studentName: `${surname} ${name}` } }
  //     })
  //     return studentTests
  //   })
  //   .then((tests) => {
  //     const thisStudentResults = tests.map((test) => {
  //       const studentGroupName = test.groupName;
  //       const studentDate = test.date;
  //       const studentSubject = test.subject;
  //       const studentQuestionsQuantity = test.questionsQuantity;
  //       const studentTestFormat = test.format;
  //       const studentGrades = test.studentGrades.filter((studentGrade) => studentGrade.studentName == `${surname} ${name}`);
  //       const studentName = studentGrades[0].studentName;
  //       const studentGrade = studentGrades[0].studentGrade;
  //       const percentOfMaximum = studentGrade / studentQuestionsQuantity * 100;

  //       const studentTest = {
  //         studentGroupName,
  //         studentDate,
  //         studentSubject,
  //         studentTestFormat,
  //         studentQuestionsQuantity,
  //         studentName,
  //         studentGrade,
  //         percentOfMaximum
  //       };

  //       return studentTest;
  //     });
  //     console.log(thisStudentResults);
  //     res.status(201).render('./pages/studentPage', {
  //       studentInfo,
  //       thisStudentResults,
  //       globalLink,
  //     });
  //   });
};


exports.getAll = async (req, res, next) => {

  let students;

  db.manyOrNone(`SELECT * from students`)
  .then(function (data) {
    students = data;
    console.log(data);
    res.status(200).render('./pages/studentsAll', {
      students,
      globalLink
    })
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  });









// const allStudents = await Student.find({});

//   res.status(201).render('./pages/studentsAll', {
//     allStudents,
//     globalLink,
//   })

};

