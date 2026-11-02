const Joi = require("joi");

const registerSchema = Joi.object({
  nombreCompleto: Joi.string().trim().min(3).max(100).required(),
  email: Joi.string().trim().email().max(150).required(),
  password: Joi.string().min(8).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};
