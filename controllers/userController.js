const User = require('./../models/userModel');
const Group = require('./../models/groupModel');


const globalLink = 'http://localhost:3000';

exports.profilePage = async (req, res, next) => {


    const groups = await Group.find()
    console.log(groups.map(group => group._id))



    res.status(200).render('./pages/profilePage', {
      globalLink,
      groups
    });
  };