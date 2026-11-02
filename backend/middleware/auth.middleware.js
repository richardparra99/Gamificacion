const jwt = require("jsonwebtoken");
const db = require("../models");

const verificarToken = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        mensaje: "Token no proporcionado",
      });
    }

    const partes = authorization.split(" ");

    if (partes.length !== 2 || partes[0] !== "Bearer" || !partes[1]) {
      return res.status(401).json({
        mensaje: "Formato de token inválido",
      });
    }

    const token = partes[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    const usuario = await db.usuario.findByPk(decoded.sub);

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Usuario no encontrado",
      });
    }

    req.usuario = usuario;

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        mensaje: "Token inválido o expirado",
      });
    }

    console.error("Error al verificar autenticación:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

module.exports = verificarToken;
