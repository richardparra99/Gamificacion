const Joi = require("joi");

const crearProyectoSchema = Joi.object({
  nombre: Joi.string().trim().min(3).max(150).required(),
  descripcion: Joi.string().trim().allow("", null),
});

const actualizarProyectoSchema = Joi.object({
  nombre: Joi.string().trim().min(3).max(150),
  descripcion: Joi.string().trim().allow("", null),
  estado: Joi.string().valid("ACTIVO", "FINALIZADO"),
}).min(1);

const agregarMiembroSchema = Joi.object({
  email: Joi.string().trim().email().required(),
});

module.exports = {
  crearProyectoSchema,
  actualizarProyectoSchema,
  agregarMiembroSchema,
};
