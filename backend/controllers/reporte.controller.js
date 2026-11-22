const { Op } = require("sequelize");
const db = require("../models");

const {
  resumirActividades,
  agruparCumplimientosPorFecha,
  resumirMiembros,
} = require("../utils/progreso.utils");

// Fecha en formato YYYY-MM-DD y calendario válido
const esFechaValida = (valor) => {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  const fecha = new Date(`${valor}T00:00:00Z`);

  return (
    !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor
  );
};

// Período por defecto: últimos 30 días UTC
const obtenerRango = (query) => {
  const hoy = new Date();
  const finDefault = hoy.toISOString().slice(0, 10);

  const inicioDefault = new Date(hoy);
  inicioDefault.setUTCDate(inicioDefault.getUTCDate() - 29);

  const inicio = query.desde || inicioDefault.toISOString().slice(0, 10);

  const fin = query.hasta || finDefault;

  if (!esFechaValida(inicio) || !esFechaValida(fin) || inicio > fin) {
    return null;
  }

  return { desde: inicio, hasta: fin };
};

const consultarCumplimientos = async (actividades, rango) => {
  const ids = actividades.map((actividad) => actividad.id);

  if (ids.length === 0) return [];

  return db.cumplimiento.findAll({
    where: {
      actividadId: { [Op.in]: ids },
      fecha: {
        [Op.between]: [rango.desde, rango.hasta],
      },
    },
    attributes: ["id", "actividadId", "fecha", "periodo"],
    order: [["fecha", "ASC"]],
    raw: true,
  });
};

// Acceso únicamente para miembros del proyecto
const buscarProyectoAutorizado = async (proyectoId, usuarioId) => {
  const proyecto = await db.proyecto.findByPk(proyectoId);

  if (!proyecto) return null;

  const membresia = await db.proyectoUsuario.findOne({
    where: {
      proyectoId,
      usuarioId,
    },
  });

  return membresia ? proyecto : null;
};

const manejarError = (res, error) => {
  console.error("Error al generar reporte:", error);

  return res.status(500).json({
    mensaje: "Error interno del servidor",
  });
};

// GET /api/reportes/resumen
exports.resumenPersonal = async (req, res) => {
  try {
    const actividades = await db.actividad.findAll({
      where: {
        usuarioId: req.usuario.id,
        proyectoId: null,
      },
      raw: true,
    });

    const resumen = resumirActividades(actividades);

    return res.status(200).json({
      mensaje: "Resumen personal obtenido",
      usuarioId: req.usuario.id,
      resumen,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

// GET /api/reportes/historial
exports.historialPersonal = async (req, res) => {
  try {
    const rango = obtenerRango(req.query);

    if (!rango) {
      return res.status(400).json({
        mensaje: "Rango de fechas inválido",
      });
    }

    const actividades = await db.actividad.findAll({
      where: {
        usuarioId: req.usuario.id,
        proyectoId: null,
      },
      attributes: ["id"],
      raw: true,
    });

    const cumplimientos = await consultarCumplimientos(actividades, rango);

    return res.status(200).json({
      usuarioId: req.usuario.id,
      periodo: rango,
      totalCumplimientos: cumplimientos.length,
      porFecha: agruparCumplimientosPorFecha(cumplimientos),
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

// GET /api/reportes/proyectos/:id
exports.resumenProyecto = async (req, res) => {
  try {
    const proyectoId = Number(req.params.id);

    if (!Number.isSafeInteger(proyectoId) || proyectoId <= 0) {
      return res.status(400).json({
        mensaje: "ID de proyecto inválido",
      });
    }

    const proyecto = await buscarProyectoAutorizado(proyectoId, req.usuario.id);

    if (!proyecto) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado o sin acceso",
      });
    }

    const rango = obtenerRango(req.query);

    if (!rango) {
      return res.status(400).json({
        mensaje: "Rango de fechas inválido",
      });
    }

    const actividades = await db.actividad.findAll({
      where: { proyectoId },
      raw: true,
    });

    const cumplimientos = await consultarCumplimientos(actividades, rango);

    return res.status(200).json({
      proyecto: {
        id: proyecto.id,
        nombre: proyecto.nombre,
        estado: proyecto.estado,
      },
      resumen: resumirActividades(actividades),
      periodo: rango,
      totalCumplimientosPeriodo: cumplimientos.length,
      cumplimientosPorFecha: agruparCumplimientosPorFecha(cumplimientos),
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

// GET /api/reportes/proyectos/:id/miembros
exports.reporteMiembros = async (req, res) => {
  try {
    const proyectoId = Number(req.params.id);

    if (!Number.isSafeInteger(proyectoId) || proyectoId <= 0) {
      return res.status(400).json({
        mensaje: "ID de proyecto inválido",
      });
    }

    const proyecto = await buscarProyectoAutorizado(proyectoId, req.usuario.id);

    if (!proyecto) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado o sin acceso",
      });
    }

    const rango = obtenerRango(req.query);

    if (!rango) {
      return res.status(400).json({
        mensaje: "Rango de fechas inválido",
      });
    }

    const [usuarios, actividades] = await Promise.all([
      proyecto.getMiembros({
        attributes: ["id", "nombreCompleto"],
        joinTableAttributes: ["rol"],
      }),

      db.actividad.findAll({
        where: { proyectoId },
        raw: true,
      }),
    ]);

    const cumplimientos = await consultarCumplimientos(actividades, rango);

    const miembros = usuarios.map((usuario) => ({
      id: usuario.id,
      nombreCompleto: usuario.nombreCompleto,
      rol: usuario.ProyectoUsuario.rol,
    }));

    const estadisticas = resumirMiembros(miembros, actividades, cumplimientos);

    return res.status(200).json({
      proyectoId,
      periodo: rango,
      miembros: estadisticas,
    });
  } catch (error) {
    return manejarError(res, error);
  }
};
