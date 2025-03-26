const Joi = require("joi");

const edusohaValidation = Joi.object({
  eduId: Joi.number().required(),
  sohaId: Joi.number().required(),
});

module.exports = edusohaValidation;
