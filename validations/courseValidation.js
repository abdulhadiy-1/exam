const Joi = require("joi");

const courseRegisterValidation = Joi.object({
  eduId: Joi.number().required(),
  sohaId: Joi.number().required(),
  fanId: Joi.number().required(),
  filialId: Joi.number().required(),
});

module.exports = courseRegisterValidation;
