const Joi = require("joi");

const edusohaValidation = Joi.object({
  eduId: Joi.number().integer().required(),
  sohaId: Joi.number().integer().required(),
});

module.exports = edusohaValidation;
