const Joi = require("joi");

const courseRegisterValidation = Joi.object({
  eduId: Joi.number().integer().required(),
  sohaId: Joi.number().integer().required(),
  fanId: Joi.number().integer().required(),
  filialId: Joi.number().integer().required(),
  userId: Joi.number().integer().required(),
});

module.exports = courseRegisterValidation;
