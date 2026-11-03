const { Op } = require("sequelize");
const db = require("../models");

// Función pura: construye el período de cumplimiento.
// Utilizamos UTC de forma consistente en esta primera versión.
const obtenerPeriodo = (fecha, tipo, frecuencia) => {
  if (tipo === "UNICA") return "UNICA";

  const dia = new Date(fecha);

  if (frecuencia === "DIARIA") {
    return dia.toISOString().slice(0, 10);
  }

  const diaSemana = dia.getUTCDay();
  const diferencia = (diaSemana + 6) % 7;

  dia.setUTCDate(dia.getUTCDate() - diferencia);

  return dia.toISOString().slice(0, 10);
};

const fechaActual = () => new Date().toISOString().slice(0, 10);

const buscarPropia = (id, usuarioId) =>
  db.actividad.findOne({
    where: { id, usuarioId },
  });

const manejarError = (res, error) => {
  console.error("Error de actividades:", error);

  return res.status(500).json({
    mensaje: "Error interno del servidor",
  });
};

// POST /api/actividades
exports.crear = async (req, res) => {
  try {
    const actividad = await db.actividad.create({
      titulo: req.body.titulo,
      descripcion: req.body.descripcion ?? null,
      tipo: req.body.tipo,
      frecuencia: req.body.frecuencia ?? null,
      fechaLimite: req.body.fechaLimite ?? null,
      usuarioId: req.usuario.id,
    });

    return res.status(201).json({
      mensaje: "Actividad creada correctamente",
      actividad,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

// GET /api/actividades
exports.listar = async (req, res) => {
  try {
    const actividades = await db.actividad.findAll({
      where: { usuarioId: req.usuario.id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.cumplimiento,
          as: "cumplimientos",
          attributes: ["id", "fecha", "periodo"],
        },
      ],
    });

    return res.json({ actividades });
  } catch (error) {
    return manejarError(res, error);
  }
};

// GET /api/actividades/:id
exports.obtener = async (req, res) => {
  try {
    const actividad = await buscarPropia(req.params.id, req.usuario.id);

    if (!actividad) {
      return res.status(404).json({
        mensaje: "Actividad no encontrada",
      });
    }

    return res.json({ actividad });
  } catch (error) {
    return manejarError(res, error);
  }
};

// PUT /api/actividades/:id
exports.actualizar = async (req, res) => {
  try {
    const actividad = await buscarPropia(req.params.id, req.usuario.id);

    if (!actividad) {
      return res.status(404).json({
        mensaje: "Actividad no encontrada",
      });
    }

    await actividad.update(req.body);

    return res.json({
      mensaje: "Actividad actualizada correctamente",
      actividad,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

// POST /api/actividades/:id/completar
exports.completar = async (req, res) => {
  try {
    const actividad = await buscarPropia(req.params.id, req.usuario.id);

    if (!actividad) {
      return res.status(404).json({
        mensaje: "Actividad no encontrada",
      });
    }

    if (actividad.tipo === "UNICA" && actividad.estado === "COMPLETADA") {
      return res.status(409).json({
        mensaje: "Esta actividad ya fue completada",
      });
    }

    const fecha = fechaActual();

    const periodo = obtenerPeriodo(fecha, actividad.tipo, actividad.frecuencia);

    const existente = await db.cumplimiento.findOne({
      where: {
        actividadId: actividad.id,
        periodo,
      },
    });

    if (existente) {
      return res.status(409).json({
        mensaje: "Ya registraste el cumplimiento de este período",
      });
    }

    const cumplimiento = await db.sequelize.transaction(async (transaction) => {
      const nuevo = await db.cumplimiento.create(
        {
          actividadId: actividad.id,
          fecha,
          periodo,
        },
        { transaction },
      );

      if (actividad.tipo === "UNICA") {
        await actividad.update({ estado: "COMPLETADA" }, { transaction });
      }

      return nuevo;
    });

    return res.status(201).json({
      mensaje: "Cumplimiento registrado correctamente",
      cumplimiento,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        mensaje: "El cumplimiento ya está registrado",
      });
    }

    return manejarError(res, error);
  }
};

// GET /api/actividades/:id/historial
exports.historial = async (req, res) => {
  try {
    const actividad = await buscarPropia(req.params.id, req.usuario.id);

    if (!actividad) {
      return res.status(404).json({
        mensaje: "Actividad no encontrada",
      });
    }

    const cumplimientos = await db.cumplimiento.findAll({
      where: { actividadId: actividad.id },
      order: [["fecha", "DESC"]],
    });

    return res.json({
      actividadId: actividad.id,
      totalCumplimientos: cumplimientos.length,
      cumplimientos,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

// DELETE /api/actividades/:id
exports.eliminar = async (req, res) => {
  try {
    const actividad = await buscarPropia(req.params.id, req.usuario.id);

    if (!actividad) {
      return res.status(404).json({
        mensaje: "Actividad no encontrada",
      });
    }

    await actividad.destroy();

    return res.json({
      mensaje: "Actividad eliminada correctamente",
    });
  } catch (error) {
    return manejarError(res, error);
  }
};
