const mongoose = require('mongoose');


const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  surname: {
    type: String,
    required: [true, 'Please tell us your surname']
  },
  classNumber: {
    type: Number,
    required: [true, 'Please provide your class number'],
  },
  subjects: [ {type: String, required: true}],
  actual: {
      type: String,
      enum: ['yes', 'no'],
      default: 'yes',
  }
});


const Student = mongoose.model('Student', studentSchema);

module.exports = Student;