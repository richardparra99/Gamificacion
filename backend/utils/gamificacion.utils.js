// Reglas inmutables del sistema
const PUNTOS = Object.freeze({
  UNICA: 50,
  DIARIA: 10,
  SEMANAL: 25,
});

const LOGROS = Object.freeze([
  Object.freeze({
    codigo: "PRIMER_PASO",
    nombre: "Primer paso",
    requisito: 1,
  }),
  Object.freeze({
    codigo: "CONSTANCIA",
    nombre: "Constancia",
    requisito: 5,
  }),
  Object.freeze({
    codigo: "IMPARABLE",
    nombre: "Imparable",
    requisito: 10,
  }),
]);

// Calcula puntos según el tipo de actividad
const calcularPuntos = (tipo, frecuencia) => {
  if (tipo === "UNICA") {
    return PUNTOS.UNICA;
  }

  if (tipo === "RECURRENTE") {
    return PUNTOS[frecuencia] || 0;
  }

  return 0;
};

// Suma movimientos sin modificar el arreglo original
const calcularExperiencia = (movimientos) =>
  movimientos.reduce((total, movimiento) => total + movimiento.puntos, 0);

// Calcula el nivel usando XP acumulada
const calcularNivel = (experiencia) =>
  Math.floor(Math.max(0, experiencia) / 100) + 1;

// Calcula progreso hacia el siguiente nivel
const calcularProgresoNivel = (experiencia) => {
  const xp = Math.max(0, experiencia);

  return {
    nivel: calcularNivel(xp),
    xpActualNivel: xp % 100,
    xpSiguienteNivel: 100,
    xpRestante: 100 - (xp % 100),
  };
};

// Determina los logros que corresponden al usuario
const calcularLogros = (totalCumplimientos) =>
  LOGROS.filter((logro) => totalCumplimientos >= logro.requisito);

module.exports = {
  PUNTOS,
  LOGROS,
  calcularPuntos,
  calcularExperiencia,
  calcularNivel,
  calcularProgresoNivel,
  calcularLogros,
};
