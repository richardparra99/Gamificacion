const db = require("../models");

const errorInterno = (res, error) => {
  console.error("Error en proyectos:", error);

  return res.status(500).json({
    mensaje: "Error interno del servidor",
  });
};

// Comprobar acceso al proyecto
const buscarAcceso = async (proyectoId, usuarioId) => {
  const proyecto = await db.proyecto.findByPk(proyectoId);

  if (!proyecto) return null;

  const membresia = await db.proyectoUsuario.findOne({
    where: {
      proyectoId: proyecto.id,
      usuarioId,
    },
  });

  return membresia ? proyecto : null;
};

// Comprobar propietario
const esPropietario = (proyecto, usuarioId) =>
  proyecto.propietarioId === usuarioId;

// CREAR PROYECTO
// POST /api/proyectos
exports.crear = async (req, res) => {
  try {
    const proyecto = await db.sequelize.transaction(async (transaction) => {
      const nuevo = await db.proyecto.create(
        {
          nombre: req.body.nombre,
          descripcion: req.body.descripcion ?? null,
          propietarioId: req.usuario.id,
        },
        { transaction },
      );

      await db.proyectoUsuario.create(
        {
          proyectoId: nuevo.id,
          usuarioId: req.usuario.id,
          rol: "ADMIN",
        },
        { transaction },
      );

      return nuevo;
    });

    return res.status(201).json({
      mensaje: "Proyecto creado correctamente",
      proyecto,
    });
  } catch (error) {
    return errorInterno(res, error);
  }
};

// LISTAR PROYECTOS
// GET /api/proyectos
exports.listar = async (req, res) => {
  try {
    const usuario = await db.usuario.findByPk(req.usuario.id);

    const proyectos = await usuario.getProyectos({
      joinTableAttributes: ["rol"],
    });

    return res.status(200).json({
      proyectos,
    });
  } catch (error) {
    return errorInterno(res, error);
  }
};

// OBTENER PROYECTO Y MIEMBROS
// GET /api/proyectos/:id
exports.obtener = async (req, res) => {
  try {
    const proyecto = await buscarAcceso(req.params.id, req.usuario.id);

    if (!proyecto) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado",
      });
    }

    const miembros = await proyecto.getMiembros({
      attributes: ["id", "nombreCompleto", "email"],
      joinTableAttributes: ["rol"],
    });

    return res.status(200).json({
      proyecto,
      miembros,
    });
  } catch (error) {
    return errorInterno(res, error);
  }
};

// ACTUALIZAR PROYECTO
// PUT /api/proyectos/:id
exports.actualizar = async (req, res) => {
  try {
    const proyecto = await buscarAcceso(req.params.id, req.usuario.id);

    if (!proyecto) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado",
      });
    }

    if (!esPropietario(proyecto, req.usuario.id)) {
      return res.status(403).json({
        mensaje: "Solo el propietario puede editar",
      });
    }

    // Solo permitir los campos editables
    const cambios = {};

    for (const campo of ["nombre", "descripcion", "estado"]) {
      if (Object.prototype.hasOwnProperty.call(req.body, campo)) {
        cambios[campo] = req.body[campo];
      }
    }

    await proyecto.update(cambios);

    return res.status(200).json({
      mensaje: "Proyecto actualizado correctamente",
      proyecto,
    });
  } catch (error) {
    return errorInterno(res, error);
  }
};

// AGREGAR MIEMBRO
// POST /api/proyectos/:id/miembros
exports.agregarMiembro = async (req, res) => {
  try {
    const proyecto = await buscarAcceso(req.params.id, req.usuario.id);

    if (!proyecto) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado",
      });
    }

    if (!esPropietario(proyecto, req.usuario.id)) {
      return res.status(403).json({
        mensaje: "Solo el propietario puede agregar miembros",
      });
    }

    if (proyecto.estado !== "ACTIVO") {
      return res.status(409).json({
        mensaje: "El proyecto no está activo",
      });
    }

    const email = req.body.email.trim().toLowerCase();

    const usuario = await db.usuario.findOne({
      where: { email },
    });

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    const existente = await db.proyectoUsuario.findOne({
      where: {
        proyectoId: proyecto.id,
        usuarioId: usuario.id,
      },
    });

    if (existente) {
      return res.status(409).json({
        mensaje: "Este usuario ya pertenece al proyecto",
      });
    }

    try {
      await db.proyectoUsuario.create({
        proyectoId: proyecto.id,
        usuarioId: usuario.id,
        rol: "MIEMBRO",
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          mensaje: "Este usuario ya pertenece al proyecto",
        });
      }

      throw error;
    }

    return res.status(201).json({
      mensaje: "Miembro agregado correctamente",
      usuario: {
        id: usuario.id,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
      },
    });
  } catch (error) {
    return errorInterno(res, error);
  }
};

// RETIRAR MIEMBRO
// DELETE /api/proyectos/:id/miembros/:usuarioId
exports.eliminarMiembro = async (req, res) => {
  try {
    const proyecto = await buscarAcceso(req.params.id, req.usuario.id);

    if (!proyecto) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado",
      });
    }

    if (!esPropietario(proyecto, req.usuario.id)) {
      return res.status(403).json({
        mensaje: "Solo el propietario puede retirar miembros",
      });
    }

    const usuarioId = Number(req.params.usuarioId);

    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
      return res.status(400).json({
        mensaje: "ID de usuario inválido",
      });
    }

    if (usuarioId === proyecto.propietarioId) {
      return res.status(400).json({
        mensaje: "No puedes retirar al propietario",
      });
    }

    // Evitar retirar miembros con actividades asignadas
    const asignadas = await db.actividad.count({
      where: {
        proyectoId: proyecto.id,
        asignadoAId: usuarioId,
      },
    });

    if (asignadas > 0) {
      return res.status(409).json({
        mensaje:
          "El usuario tiene actividades asignadas. Debes reasignarlas antes de retirarlo",
        actividadesAsignadas: asignadas,
      });
    }

    const eliminados = await db.proyectoUsuario.destroy({
      where: {
        proyectoId: proyecto.id,
        usuarioId,
      },
    });

    if (!eliminados) {
      return res.status(404).json({
        mensaje: "El miembro no pertenece al proyecto",
      });
    }

    return res.status(200).json({
      mensaje: "Miembro retirado correctamente",
    });
  } catch (error) {
    return errorInterno(res, error);
  }
};

// ELIMINAR PROYECTO
// DELETE /api/proyectos/:id
exports.eliminar = async (req, res) => {
  try {
    const proyecto = await buscarAcceso(req.params.id, req.usuario.id);

    if (!proyecto) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado",
      });
    }

    if (!esPropietario(proyecto, req.usuario.id)) {
      return res.status(403).json({
        mensaje: "Solo el propietario puede eliminar",
      });
    }

    const resultado = await db.sequelize.transaction(async (transaction) => {
      const proyectoBloqueado = await db.proyecto.findByPk(proyecto.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!proyectoBloqueado) {
        return {
          status: 404,
          mensaje: "Proyecto no encontrado",
        };
      }

      // Conservar proyectos con actividades registradas
      const totalActividades = await db.actividad.count({
        where: {
          proyectoId: proyecto.id,
        },
        transaction,
      });

      if (totalActividades > 0) {
        return {
          status: 409,
          mensaje:
            "Este proyecto contiene actividades. No se puede eliminar sin afectar su historial",
          totalActividades,
        };
      }

      await db.proyectoUsuario.destroy({
        where: {
          proyectoId: proyecto.id,
        },
        transaction,
      });

      await proyectoBloqueado.destroy({
        transaction,
      });

      return {
        status: 200,
        mensaje: "Proyecto eliminado correctamente",
      };
    });

    return res.status(resultado.status).json({
      mensaje: resultado.mensaje,
      ...(resultado.totalActividades !== undefined && {
        totalActividades: resultado.totalActividades,
      }),
    });
  } catch (error) {
    return errorInterno(res, error);
  }
};
