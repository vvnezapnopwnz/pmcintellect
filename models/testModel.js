const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Please tell us date!'],
    min: '2021-09-01',
    max: '2022-05-01'
  },
  groupName: {
    type: String,
    required: [true, 'Please provide your groupName'],
  },
  subject: {
      type: String,
      required: [true, 'Please provide your subject'],
    },
  studentGrades: [{ type: Object }],
  format: {
      type: String,
      required: [true, 'Please provide your test format'],
  },
  questionsQuantity: {
    type: Number,
    required: [true, 'Provide questions Quantity'],
  },
  averageGrade: {
    type: Number,
    required: [true, ''],
  }

});

// userSchema.pre(/^find/, function(next) {
//   // this points to the current query
//   this.find({ active: { $ne: false } });
//   next();
// });

const Test = mongoose.model('Test', testSchema);

module.exports = Test;
