const Student = require('./../models/studentModel');

exports.createStudentPage = async (req, res, next) => {
    res.status(200).render('./createPages/student');
};

exports.createStudent = async (req, res, next) => {
    console.log(req.body)

const newStudent = await Student.create(req.body);
  
      res.status(201).json({
        status: 'success',
        data: {
          data: newStudent
        }
      });
};


exports.getStudent = async (req, res, next) => {
    console.log(req.params)
    const StudentId = req.params.id

    const Student = await Student.findById(StudentId);
// const newStudent = await Student.create(req.body);
  

res.status(201).render('StudentPage',{
    Student
  })
};

