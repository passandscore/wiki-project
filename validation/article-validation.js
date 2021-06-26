const { body } = require('express-validator');
const Article = require('../models/Article');

exports.createValidator = (req, res) => {
  return [
    body('title')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Please provide a title')
      .isLength({ min: 5 })
      .withMessage('Title should be between at least 5 characters'),

    body('description')
      .not()
      .isEmpty()
      .withMessage('Please provide a description')
      .isLength({ min: 20})
      .withMessage('Description should be between at least 20 characters'),
  ];
};


