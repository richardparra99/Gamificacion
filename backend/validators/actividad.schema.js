const Joi = require("joi");

// Validar fecha en formato YYYY-MM-DD sin convertirla
const fechaSchema = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .custom((value, helpers) => {
    const fecha = new Date(`${value}T00:00:00.000Z`);

    if (
      Number.isNaN(fecha.getTime()) ||
      fecha.toISOString().slice(0, 10) !== value
    ) {
      return helpers.message("La fecha no es válida");
    }

    return value;
  })
  .allow(null);

const validarTipo = (objeto, helpers) => {
  if (objeto.tipo === "RECURRENTE" && !objeto.frecuencia) {
    return helpers.message("Una actividad recurrente requiere frecuencia");
  }

  if (objeto.tipo === "UNICA" && objeto.frecuencia) {
    return helpers.message("Una actividad única no debe tener frecuencia");
  }

  return objeto;
};

const crearActividadSchema = Joi.object({
  titulo: Joi.string().trim().min(3).max(150).required(),

  descripcion: Joi.string().trim().allow("", null),

  tipo: Joi.string().valid("UNICA", "RECURRENTE").required(),

  frecuencia: Joi.string().valid("DIARIA", "SEMANAL").allow(null),

  fechaLimite: fechaSchema,
}).custom(validarTipo);

const actualizarActividadSchema = Joi.object({
  titulo: Joi.string().trim().min(3).max(150),

  descripcion: Joi.string().trim().allow("", null),

  fechaLimite: fechaSchema,
}).min(1);

module.exports = {
  crearActividadSchema,
  actualizarActividadSchema,
};
