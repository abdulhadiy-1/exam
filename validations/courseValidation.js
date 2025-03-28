const Joi = require("joi");

const courseRegisterValidation = Joi.object({
  eduId: Joi.number().required(),
  sohaId: Joi.number().required(),
  fanId: Joi.number().required(),
  fillialId: Joi.number().required(),
});

module.exports = courseRegisterValidation;
