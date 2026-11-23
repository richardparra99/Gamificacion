const db = require("../models");

const { otorgarPuntos } = require("../services/gamificacion.service");

// Obtener fecha actual en UTC
const fechaActual = () => new Date().toISOString().slice(0, 10);

// Función pura: calcular el período del cumplimiento
const obtenerPeriodo = (fecha, tipo, frecuencia) => {
  if (tipo === "UNICA") {
    return "UNICA";
  }

  if (frecuencia === "DIARIA") {
    return fecha;
  }

  if (frecuencia === "SEMANAL") {
    const dia = new Date(`${fecha}T00:00:00.000Z`);

    const diferencia = (dia.getUTCDay() + 6) % 7;

    dia.setUTCDate(dia.getUTCDate() - diferencia);

    return dia.toISOString().slice(0, 10);
  }

  return null;
};

// Buscar solamente actividades personales
const buscarPropia = (id, usuarioId, opciones = {}) =>
  db.actividad.findOne({
    where: {
      id,
      usuarioId,
      proyectoId: null,
    },
    ...opciones,
  });

// Manejar errores internos
const manejarError = (res, error) => {
  console.error("Error de actividades:", error);

  return res.status(500).json({
    mensaje: "Error interno del servidor",
  });
};

// CREAR ACTIVIDAD PERSONAL
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
      proyectoId: null,
      asignadoAId: null,
    });

    return res.status(201).json({
      mensaje: "Actividad creada correctamente",
      actividad,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

// LISTAR ACTIVIDADES PERSONALES
// GET /api/actividades
exports.listar = async (req, res) => {
  try {
    const actividades = await db.actividad.findAll({
      where: {
        usuarioId: req.usuario.id,
        proyectoId: null,
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.cumplimiento,
          as: "cumplimientos",
          attributes: ["id", "fecha", "periodo"],
        },
      ],
    });

    return res.status(200).json({
      actividades,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

// OBTENER ACTIVIDAD PERSONAL
// GET /api/actividades/:id
exports.obtener = async (req, res) => {
  try {
    const actividad = await buscarPropia(req.params.id, req.usuario.id);

    if (!actividad) {
      return res.status(404).json({
        mensaje: "Actividad no encontrada",
      });
    }

    return res.status(200).json({
      actividad,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

// ACTUALIZAR ACTIVIDAD PERSONAL
// PUT /api/actividades/:id
exports.actualizar = async (req, res) => {
  try {
    const resultado = await db.sequelize.transaction(async (transaction) => {
      const actividad = await buscarPropia(req.params.id, req.usuario.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!actividad) {
        return {
          status: 404,
          mensaje: "Actividad no encontrada",
        };
      }

      // Evitar modificar una actividad con historial
      const totalCumplimientos = await db.cumplimiento.count({
        where: {
          actividadId: actividad.id,
        },
        transaction,
      });

      if (totalCumplimientos > 0) {
        return {
          status: 409,
          mensaje:
            "No puedes editar una actividad con cumplimientos registrados",
        };
      }

      // Solo campos permitidos por el validador
      const cambios = {};

      for (const campo of ["titulo", "descripcion", "fechaLimite"]) {
        if (Object.prototype.hasOwnProperty.call(req.body, campo)) {
          cambios[campo] = req.body[campo];
        }
      }

      await actividad.update(cambios, {
        transaction,
      });

      return {
        status: 200,
        mensaje: "Actividad actualizada correctamente",
        actividad,
      };
    });

    return res.status(resultado.status).json({
      mensaje: resultado.mensaje,
      ...(resultado.actividad && {
        actividad: resultado.actividad,
      }),
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

// COMPLETAR ACTIVIDAD PERSONAL Y GANAR XP
// POST /api/actividades/:id/completar
exports.completar = async (req, res) => {
  try {
    const actividadId = Number(req.params.id);

    if (!Number.isSafeInteger(actividadId) || actividadId <= 0) {
      return res.status(400).json({
        mensaje: "ID de actividad inválido",
      });
    }

    const resultado = await db.sequelize.transaction(async (transaction) => {
      // Bloquear actividad para evitar duplicados
      const actividad = await buscarPropia(actividadId, req.usuario.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!actividad) {
        return {
          status: 404,
          mensaje: "Actividad personal no encontrada",
        };
      }

      if (actividad.tipo === "UNICA" && actividad.estado === "COMPLETADA") {
        return {
          status: 409,
          mensaje: "Esta actividad ya fue completada",
        };
      }

      const fecha = fechaActual();

      const periodo = obtenerPeriodo(
        fecha,
        actividad.tipo,
        actividad.frecuencia,
      );

      if (!periodo) {
        return {
          status: 409,
          mensaje: "Frecuencia de actividad inválida",
        };
      }

      // Comprobar el cumplimiento del período
      const existente = await db.cumplimiento.findOne({
        where: {
          actividadId: actividad.id,
          periodo,
        },
        transaction,
      });

      if (existente) {
        return {
          status: 409,
          mensaje: "Ya registraste el cumplimiento de este período",
        };
      }

      // Registrar cumplimiento
      const cumplimiento = await db.cumplimiento.create(
        {
          actividadId: actividad.id,
          fecha,
          periodo,
        },
        { transaction },
      );

      // Actualizar estado si es actividad única
      if (actividad.tipo === "UNICA") {
        await actividad.update(
          {
            estado: "COMPLETADA",
          },
          { transaction },
        );
      }

      // Otorgar puntos dentro de la transacción
      const recompensa = await otorgarPuntos({
        usuarioId: req.usuario.id,
        actividad,
        cumplimiento,
        transaction,
      });

      return {
        status: 201,
        mensaje: "Actividad completada y puntos otorgados correctamente",
        cumplimiento,
        recompensa,
      };
    });

    return res.status(resultado.status).json({
      mensaje: resultado.mensaje,

      ...(resultado.cumplimiento && {
        cumplimiento: resultado.cumplimiento,
      }),

      ...(resultado.recompensa && {
        recompensa: resultado.recompensa,
      }),
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        mensaje: "El cumplimiento o la recompensa ya está registrado",
      });
    }

    return manejarError(res, error);
  }
};

// HISTORIAL DE ACTIVIDAD
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
      where: {
        actividadId: actividad.id,
      },
      order: [["fecha", "DESC"]],
    });

    return res.status(200).json({
      actividadId: actividad.id,
      totalCumplimientos: cumplimientos.length,
      cumplimientos,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

// ELIMINAR ACTIVIDAD PERSONAL SIN HISTORIAL
// DELETE /api/actividades/:id
exports.eliminar = async (req, res) => {
  try {
    const resultado = await db.sequelize.transaction(async (transaction) => {
      const actividad = await buscarPropia(req.params.id, req.usuario.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!actividad) {
        return {
          status: 404,
          mensaje: "Actividad no encontrada",
        };
      }

      const totalCumplimientos = await db.cumplimiento.count({
        where: {
          actividadId: actividad.id,
        },
        transaction,
      });

      if (totalCumplimientos > 0) {
        return {
          status: 409,
          mensaje:
            "Esta actividad tiene historial. No se puede eliminar sin perder registros de gamificación",
        };
      }

      await actividad.destroy({
        transaction,
      });

      return {
        status: 200,
        mensaje: "Actividad eliminada correctamente",
      };
    });

    return res.status(resultado.status).json({
      mensaje: resultado.mensaje,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};
