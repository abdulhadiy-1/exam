const Joi = require("joi");

const edufanValidation = Joi.object({
  eduId: Joi.number().required(),
  fanId: Joi.number().required(),
});

module.exports = edufanValidation;
