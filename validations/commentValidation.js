const Joi = require("joi");

const commentValidation = Joi.object({
  text: Joi.string().min(3).max(500).required(),
  userId: Joi.number().integer().required(),
  elonId: Joi.number().integer().required(),
});

module.exports = commentValidation;
