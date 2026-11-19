const db = require("../models");

const {
  obtenerPerfilGamificacion,
} = require("../services/gamificacion.service");

// GET /api/gamificacion/me
exports.miPerfil = async (req, res) => {
  try {
    const perfil = await obtenerPerfilGamificacion(req.usuario.id);

    return res.status(200).json({
      mensaje: "Perfil de gamificación obtenido",
      perfil,
    });
  } catch (error) {
    console.error("Error al consultar gamificación:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

// GET /api/gamificacion/historial
exports.historial = async (req, res) => {
  try {
    const movimientos = await db.movimientoPuntos.findAll({
      where: {
        usuarioId: req.usuario.id,
      },
      order: [["createdAt", "DESC"]],
      attributes: ["id", "cumplimientoId", "puntos", "motivo", "createdAt"],
    });

    return res.status(200).json({
      totalMovimientos: movimientos.length,
      movimientos,
    });
  } catch (error) {
    console.error("Error al consultar historial:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

// GET /api/gamificacion/ranking
exports.ranking = async (req, res) => {
  try {
    const usuarios = await db.usuario.findAll({
      attributes: ["id", "nombreCompleto"],
      include: [
        {
          model: db.movimientoPuntos,
          as: "movimientosPuntos",
          attributes: ["puntos"],
        },
      ],
    });

    const ranking = usuarios
      .map((usuario) => {
        const xp = usuario.movimientosPuntos.reduce(
          (total, movimiento) => total + movimiento.puntos,
          0,
        );

        return {
          usuarioId: usuario.id,
          nombreCompleto: usuario.nombreCompleto,
          experiencia: xp,
          nivel: Math.floor(xp / 100) + 1,
        };
      })
      .sort(
        (a, b) => b.experiencia - a.experiencia || a.usuarioId - b.usuarioId,
      )
      .map((usuario, indice) => ({
        posicion: indice + 1,
        ...usuario,
      }));

    return res.status(200).json({ ranking });
  } catch (error) {
    console.error("Error al consultar ranking:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};
