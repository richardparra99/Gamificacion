const calcularPorcentaje = (parte, total) => {
  if (total === 0) return 0;

  return Number(((parte / total) * 100).toFixed(2));
};

// Estadísticas de actividades únicas
const resumirActividades = (actividades) => {
  const unicas = actividades.filter((actividad) => actividad.tipo === "UNICA");

  const recurrentes = actividades.filter(
    (actividad) => actividad.tipo === "RECURRENTE",
  );

  const completadas = unicas.filter(
    (actividad) => actividad.estado === "COMPLETADA",
  ).length;

  const pendientes = unicas.length - completadas;

  return {
    totalActividades: actividades.length,
    actividadesUnicas: unicas.length,
    actividadesRecurrentes: recurrentes.length,
    completadas,
    pendientes,
    porcentajeProgreso: calcularPorcentaje(completadas, unicas.length),
  };
};

// Cuenta los cumplimientos por día
const agruparCumplimientosPorFecha = (cumplimientos) => {
  const agrupados = cumplimientos.reduce((acumulador, cumplimiento) => {
    const fecha = cumplimiento.fecha;

    return {
      ...acumulador,
      [fecha]: (acumulador[fecha] || 0) + 1,
    };
  }, {});

  return Object.entries(agrupados)
    .map(([fecha, cantidad]) => ({
      fecha,
      cantidad,
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
};

// Estadísticas por integrante
const resumirMiembros = (miembros, actividades, cumplimientos) =>
  miembros.map((miembro) => {
    const asignadas = actividades.filter(
      (actividad) => actividad.asignadoAId === miembro.id,
    );

    const resumen = resumirActividades(asignadas);

    const ids = new Set(asignadas.map((actividad) => actividad.id));

    const totalCumplimientos = cumplimientos.filter((cumplimiento) =>
      ids.has(cumplimiento.actividadId),
    ).length;

    return {
      usuarioId: miembro.id,
      nombreCompleto: miembro.nombreCompleto,
      rol: miembro.rol,
      ...resumen,
      totalCumplimientos,
    };
  });

module.exports = {
  calcularPorcentaje,
  resumirActividades,
  agruparCumplimientosPorFecha,
  resumirMiembros,
};
