const { Op } = require("sequelize");
const db = require("../models");

const {
  calcularPuntos,
  calcularExperiencia,
  calcularProgresoNivel,
  calcularLogros,
} = require("../utils/gamificacion.utils");

// Registra la recompensa dentro de la misma transacción
// que creó el cumplimiento.
const otorgarPuntos = async ({
  usuarioId,
  actividad,
  cumplimiento,
  transaction,
}) => {
  if (!transaction) {
    throw new Error("Se requiere una transacción");
  }

  const puntos = calcularPuntos(actividad.tipo, actividad.frecuencia);

  if (puntos <= 0) {
    throw new Error("Tipo de actividad no válido");
  }

  // Evita registrar dos recompensas para un cumplimiento
  const movimiento = await db.movimientoPuntos.create(
    {
      usuarioId,
      cumplimientoId: cumplimiento.id,
      puntos,
      motivo: `Cumplimiento: ${actividad.titulo}`,
    },
    { transaction },
  );

  // Bloqueamos la fila del usuario para serializar
  // la evaluación de sus logros.
  await db.usuario.findByPk(usuarioId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  const totalCumplimientos = await db.movimientoPuntos.count({
    where: { usuarioId },
    transaction,
  });

  const logrosCorrespondientes = calcularLogros(totalCumplimientos);

  const codigos = logrosCorrespondientes.map((logro) => logro.codigo);

  const existentes = codigos.length
    ? await db.usuarioLogro.findAll({
        where: {
          usuarioId,
          codigo: { [Op.in]: codigos },
        },
        transaction,
      })
    : [];

  const codigosExistentes = new Set(existentes.map((logro) => logro.codigo));

  const nuevosLogros = logrosCorrespondientes.filter(
    (logro) => !codigosExistentes.has(logro.codigo),
  );

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

// Consulta la experiencia del usuario
const obtenerPerfilGamificacion = async (usuarioId) => {
  const [movimientos, logros] = await Promise.all([
    db.movimientoPuntos.findAll({
      where: { usuarioId },
      attributes: ["puntos"],
    }),
    db.usuarioLogro.findAll({
      where: { usuarioId },
      order: [["createdAt", "ASC"]],
      attributes: ["codigo", "nombre", "createdAt"],
    }),
  ]);

  const experiencia = calcularExperiencia(movimientos);

  return {
    usuarioId,
    experiencia,
    ...calcularProgresoNivel(experiencia),
    logros,
  };
};

module.exports = {
  otorgarPuntos,
  obtenerPerfilGamificacion,
};
