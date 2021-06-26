const { body } = require('express-validator');
const User = require('../models/User');

exports.loginValidator = (req, res) => {
  return [
    body('username')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Please provide username')
      .isAlphanumeric()
      .withMessage('Username should be Alphanumeric')
      .isLength({ min: 5, max: 20 })
      .withMessage('Username should be between 5-20 characters'),
    body('password', 'Check your password')
      .isAlphanumeric()
      .isLength({ min: 8, max: 20 }),
  ];
};

exports.signupValidator = (req, res) => {
  return [
    body('username')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Please provide username')
      .isAlphanumeric()
      .withMessage('Username should be Alphanumeric')
      .isLength({ min: 5, max: 20 })
      .withMessage('Username should be between 5-20 characters')
      .custom((value) => {
        return User.findOne({ username: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('Username is taken');
          }
        });
      }),

    body('password', 'Password must be 8 alphanumeric characters.')
      .isAlphanumeric()
      .isLength({ min: 8, max: 20 })
      .trim(), 

    body('repeatPassword').custom((value, {req})=>{
        if(value !==req.body.password){
          throw new Error('Password Not Matching')
        }        
          return true
    })
  ];
};
