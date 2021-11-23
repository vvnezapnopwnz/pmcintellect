const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  classNumber: {
    type: Number,
    required: [true, 'Please provide your class number'],
  },
  subjects: [{type: String, required: true}],
  students: [{type: String, required: true}],
  active: {
    type: Boolean,
    default: true,
    select: false
  },
});

// userSchema.pre(/^find/, function(next) {
//   // this points to the current query
//   this.find({ active: { $ne: false } });
//   next();
// });

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
