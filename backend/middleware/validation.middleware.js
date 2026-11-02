const validateJson = (schema) => {
  return (req, res, next) => {
    if (!req.is("application/json")) {
      return res.status(415).json({
        mensaje: "El contenido debe ser application/json",
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: false,
    });

    if (error) {
      return res.status(400).json({
        mensaje: "Error de validación",
        errores: error.details.map((detalle) => detalle.message),
      });
    }

    req.body = value;
    next();
  };
};

module.exports = validateJson;
