const { Op } = require("sequelize");

const db = require("../models");

const {
  calcularPuntos,
  calcularExperiencia,
  calcularProgresoNivel,
  calcularLogros,
} = require("../utils/gamificacion.utils");

// OTORGAR PUNTOS POR UN CUMPLIMIENTO
const otorgarPuntos = async ({
  usuarioId,
  actividad,
  cumplimiento,
  transaction,
}) => {
  if (!transaction) {
    throw new Error("Se requiere una transacción para otorgar puntos");
  }

  // Calcular los puntos mediante una función pura
  const puntos = calcularPuntos(actividad.tipo, actividad.frecuencia);

  if (puntos <= 0) {
    throw new Error("Tipo o frecuencia de actividad no válido");
  }

  // Bloquear la fila del usuario antes de registrar
  // la recompensa para serializar sus movimientos.
  const usuario = await db.usuario.findByPk(usuarioId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  // La base de datos también protege cumplimientoId
  // mediante una restricción UNIQUE.
  const movimientoExistente = await db.movimientoPuntos.findOne({
    where: {
      cumplimientoId: cumplimiento.id,
    },
    transaction,
  });

  if (movimientoExistente) {
    throw new Error("Este cumplimiento ya tiene puntos registrados");
  }

  // Registrar el movimiento
  const movimiento = await db.movimientoPuntos.create(
    {
      usuarioId,
      cumplimientoId: cumplimiento.id,
      puntos,
      motivo: `Cumplimiento: ${actividad.titulo}`,
    },
    { transaction },
  );

  // Total de cumplimientos recompensados
  const totalCumplimientos = await db.movimientoPuntos.count({
    where: {
      usuarioId,
    },
    transaction,
  });

  // Determinar los logros correspondientes
  const logrosCorrespondientes = calcularLogros(totalCumplimientos);

  const codigos = logrosCorrespondientes.map((logro) => logro.codigo);

  // Consultar logros que el usuario ya tiene
  const existentes = codigos.length
    ? await db.usuarioLogro.findAll({
        where: {
          usuarioId,
          codigo: {
            [Op.in]: codigos,
          },
        },
        transaction,
      })
    : [];

  const codigosExistentes = new Set(existentes.map((logro) => logro.codigo));

  // Filtrar únicamente logros nuevos
  const nuevosLogros = logrosCorrespondientes.filter(
    (logro) => !codigosExistentes.has(logro.codigo),
  );

  // Guardar nuevos logros
  for (const logro of nuevosLogros) {
    await db.usuarioLogro.create(
      {
        usuarioId,
        codigo: logro.codigo,
        nombre: logro.nombre,
      },
      { transaction },
    );
  }

  return {
    puntosGanados: movimiento.puntos,
    logrosDesbloqueados: nuevosLogros,
  };
};

// CONSULTAR PERFIL DE GAMIFICACIÓN
const obtenerPerfilGamificacion = async (usuarioId) => {
  const [movimientos, logros] = await Promise.all([
    db.movimientoPuntos.findAll({
      where: { usuarioId },
      attributes: ["puntos"],
    }),

    db.usuarioLogro.findAll({
      where: { usuarioId },
      attributes: ["codigo", "nombre", "createdAt"],
      order: [["createdAt", "ASC"]],
    }),
  ]);

  // Suma funcional de los puntos
  const experiencia = calcularExperiencia(movimientos);

  // Nivel y progreso calculados mediante funciones puras
  const progreso = calcularProgresoNivel(experiencia);

  return {
    usuarioId,
    experiencia,
    ...progreso,
    logros,
  };
};

module.exports = {
  otorgarPuntos,
  obtenerPerfilGamificacion,
};
