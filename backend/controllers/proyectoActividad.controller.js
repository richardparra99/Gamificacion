const db = require("../models");

// Verificar si un usuario pertenece al proyecto
const verificarMiembro = async (proyectoId, usuarioId) => {
  return db.proyectoUsuario.findOne({
    where: {
      proyectoId,
      usuarioId,
    },
  });
};

// CREAR ACTIVIDAD EN UN PROYECTO
exports.crear = async (req, res) => {
  try {
    const proyectoId = Number(req.params.id);

    if (!Number.isSafeInteger(proyectoId) || proyectoId <= 0) {
      return res.status(400).json({
        mensaje: "ID de proyecto inválido",
      });
    }

    const proyecto = await db.proyecto.findByPk(proyectoId);

    if (!proyecto) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado",
      });
    }

    const miembro = await verificarMiembro(proyectoId, req.usuario.id);

    if (!miembro) {
      return res.status(403).json({
        mensaje: "No perteneces a este proyecto",
      });
    }

    if (proyecto.estado !== "ACTIVO") {
      return res.status(409).json({
        mensaje: "El proyecto no está activo",
      });
    }

    const { titulo, descripcion, tipo, frecuencia, fechaLimite } = req.body;

    const actividad = await db.actividad.create({
      titulo,
      descripcion: descripcion ?? null,
      tipo,
      frecuencia: frecuencia ?? null,
      fechaLimite: fechaLimite ?? null,
      usuarioId: req.usuario.id,
      proyectoId,
      asignadoAId: req.usuario.id,
    });

    return res.status(201).json({
      mensaje: "Actividad creada dentro del proyecto",
      actividad,
    });
  } catch (error) {
    console.error("Error al crear actividad:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

// LISTAR ACTIVIDADES DEL PROYECTO
exports.listar = async (req, res) => {
  try {
    const proyectoId = Number(req.params.id);

    if (!Number.isSafeInteger(proyectoId) || proyectoId <= 0) {
      return res.status(400).json({
        mensaje: "ID de proyecto inválido",
      });
    }

    const miembro = await verificarMiembro(proyectoId, req.usuario.id);

    if (!miembro) {
      return res.status(403).json({
        mensaje: "No tienes acceso a este proyecto",
      });
    }

    const actividades = await db.actividad.findAll({
      where: { proyectoId },
      include: [
        {
          model: db.usuario,
          as: "responsable",
          attributes: ["id", "nombreCompleto", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      actividades,
    });
  } catch (error) {
    console.error("Error al listar actividades:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

// ASIGNAR ACTIVIDAD A UN MIEMBRO DEL PROYECTO
exports.asignar = async (req, res) => {
  try {
    const proyectoId = Number(req.params.id);
    const actividadId = Number(req.params.actividadId);
    const usuarioId = req.body.usuarioId;

    if (
      !Number.isSafeInteger(proyectoId) ||
      proyectoId <= 0 ||
      !Number.isSafeInteger(actividadId) ||
      actividadId <= 0
    ) {
      return res.status(400).json({
        mensaje: "Identificador inválido",
      });
    }

    // Buscar proyecto
    const proyecto = await db.proyecto.findByPk(proyectoId);

    if (!proyecto) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado",
      });
    }

    // Solamente el propietario puede asignar actividades
    if (proyecto.propietarioId !== req.usuario.id) {
      return res.status(403).json({
        mensaje: "No tienes permisos para asignar actividades",
      });
    }

    if (proyecto.estado !== "ACTIVO") {
      return res.status(409).json({
        mensaje: "El proyecto no está activo",
      });
    }

    // Verificar que la actividad pertenece al proyecto
    const actividad = await db.actividad.findOne({
      where: {
        id: actividadId,
        proyectoId,
      },
    });

    if (!actividad) {
      return res.status(404).json({
        mensaje: "Actividad no encontrada en este proyecto",
      });
    }

    // Buscar al usuario responsable
    const usuario = await db.usuario.findByPk(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    // Verificar su membresía
    const miembro = await db.proyectoUsuario.findOne({
      where: {
        proyectoId,
        usuarioId,
      },
    });

    if (!miembro) {
      return res.status(400).json({
        mensaje: "El usuario no pertenece al proyecto",
      });
    }

    // Evitar reasignar una actividad única completada
    if (actividad.tipo === "UNICA" && actividad.estado === "COMPLETADA") {
      return res.status(409).json({
        mensaje: "No puedes reasignar una actividad completada",
      });
    }

    await actividad.update({
      asignadoAId: usuarioId,
    });

    return res.status(200).json({
      mensaje: "Actividad asignada correctamente",
      actividad: {
        id: actividad.id,
        titulo: actividad.titulo,
        estado: actividad.estado,
        proyectoId: actividad.proyectoId,
        asignadoAId: actividad.asignadoAId,
      },
      responsable: {
        id: usuario.id,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error("Error al asignar actividad:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

// COMPLETAR ACTIVIDAD ASIGNADA
exports.completar = async (req, res) => {
  try {
    const proyectoId = Number(req.params.id);
    const actividadId = Number(req.params.actividadId);

    if (
      !Number.isSafeInteger(proyectoId) ||
      proyectoId <= 0 ||
      !Number.isSafeInteger(actividadId) ||
      actividadId <= 0
    ) {
      return res.status(400).json({
        mensaje: "Identificador inválido",
      });
    }

    const resultado = await db.sequelize.transaction(async (transaction) => {
      const actividad = await db.actividad.findOne({
        where: {
          id: actividadId,
          proyectoId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!actividad) {
        return {
          status: 404,
          mensaje: "Actividad no encontrada",
        };
      }

      // Verificar que el usuario pertenece al proyecto
      const miembro = await db.proyectoUsuario.findOne({
        where: {
          proyectoId,
          usuarioId: req.usuario.id,
        },
        transaction,
      });

      if (!miembro) {
        return {
          status: 403,
          mensaje: "No perteneces a este proyecto",
        };
      }

      // Solo el responsable puede completarla
      if (actividad.asignadoAId !== req.usuario.id) {
        return {
          status: 403,
          mensaje: "Esta actividad está asignada a otro usuario",
        };
      }

      const proyecto = await db.proyecto.findByPk(proyectoId, { transaction });

      if (!proyecto || proyecto.estado !== "ACTIVO") {
        return {
          status: 409,
          mensaje: "El proyecto no está activo",
        };
      }

      if (actividad.tipo === "UNICA" && actividad.estado === "COMPLETADA") {
        return {
          status: 409,
          mensaje: "Esta actividad ya fue completada",
        };
      }

      // Fecha UTC de esta primera versión
      const fecha = new Date().toISOString().slice(0, 10);

      let periodo = "UNICA";

      if (actividad.tipo === "RECURRENTE") {
        if (actividad.frecuencia === "DIARIA") {
          periodo = fecha;
        } else if (actividad.frecuencia === "SEMANAL") {
          const inicioSemana = new Date(`${fecha}T00:00:00.000Z`);

          const dias = (inicioSemana.getUTCDay() + 6) % 7;

          inicioSemana.setUTCDate(inicioSemana.getUTCDate() - dias);

          periodo = inicioSemana.toISOString().slice(0, 10);
        } else {
          return {
            status: 409,
            mensaje: "Frecuencia de actividad no válida",
          };
        }
      }

      // Evitar cumplimientos duplicados
      const existente = await db.cumplimiento.findOne({
        where: {
          actividadId,
          periodo,
        },
        transaction,
      });

      if (existente) {
        return {
          status: 409,
          mensaje: "Actividad ya completada en este período",
        };
      }

      const cumplimiento = await db.cumplimiento.create(
        {
          actividadId,
          fecha,
          periodo,
        },
        { transaction },
      );

      if (actividad.tipo === "UNICA") {
        await actividad.update(
          {
            estado: "COMPLETADA",
          },
          { transaction },
        );
      }

      return {
        status: 201,
        mensaje: "Actividad completada correctamente",
        cumplimiento,
      };
    });

    return res.status(resultado.status).json({
      mensaje: resultado.mensaje,
      ...(resultado.cumplimiento
        ? { cumplimiento: resultado.cumplimiento }
        : {}),
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        mensaje: "Cumplimiento ya registrado",
      });
    }

    console.error("Error al completar actividad:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};
