const Joi = require("joi");

const fanValidation = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  image: Joi.string().min(2).required(),
});

module.exports = fanValidation;
