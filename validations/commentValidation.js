const Joi = require("joi");

const commentValidation = Joi.object({
  comment: Joi.string().min(2).max(250).required(),
  star: Joi.number().min(0).max(5).required(),
  eduId: Joi.number().required(),
});

const patchValidation = Joi.object({
  comment: Joi.string().min(2).max(250).optional(),
  star: Joi.number().min(0).max(5).optional(),
  eduId: Joi.number().optional(),
});

module.exports = { commentValidation, patchValidation };
