const Joi = require("joi");

const edufanValidation = Joi.object({
  eduId: Joi.number().integer().required(),
  fanId: Joi.number().integer().required(),
});

module.exports = edufanValidation;
