const db = require("../models");

const errorInterno = (res, error) => {
  console.error("Error en proyectos:", error);
  return res.status(500).json({
    mensaje: "Error interno del servidor",
  });
};

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

const esPropietario = (proyecto, usuarioId) =>
  proyecto.propietarioId === usuarioId;

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

// GET /api/proyectos
exports.listar = async (req, res) => {
  try {
    const usuario = await db.usuario.findByPk(req.usuario.id);
    const proyectos = await usuario.getProyectos({
      joinTableAttributes: ["rol"],
    });

    return res.json({ proyectos });
  } catch (error) {
    return errorInterno(res, error);
  }
};

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

    return res.json({ proyecto, miembros });
  } catch (error) {
    return errorInterno(res, error);
  }
};

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
    await proyecto.update(req.body);
    return res.json({
      mensaje: "Proyecto actualizado correctamente",
      proyecto,
    });
  } catch (error) {
    return errorInterno(res, error);
  }
};

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

    if (usuarioId === proyecto.propietarioId) {
      return res.status(400).json({
        mensaje: "No puedes retirar al propietario",
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

    return res.json({
      mensaje: "Miembro retirado correctamente",
    });
  } catch (error) {
    return errorInterno(res, error);
  }
};

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

    await db.sequelize.transaction(async (transaction) => {
      await db.proyectoUsuario.destroy({
        where: { proyectoId: proyecto.id },
        transaction,
      });

      await proyecto.destroy({ transaction });
    });

    return res.json({
      mensaje: "Proyecto eliminado correctamente",
    });
  } catch (error) {
    return errorInterno(res, error);
  }
};
