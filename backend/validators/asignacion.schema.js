const Joi = require("joi");

const asignarActividadSchema = Joi.object({
  usuarioId: Joi.number().integer().positive().required(),
});

module.exports = {
  asignarActividadSchema,
};
