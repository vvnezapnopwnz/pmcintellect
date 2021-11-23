const User = require('./../models/userModel');
const Group = require('./../models/groupModel');


exports.profilePage = async (req, res, next) => {
    const groups = await Group.find({})
    console.log(res)
    res.status(200).render('./pages/profilePage', {
      groups
    });
  };