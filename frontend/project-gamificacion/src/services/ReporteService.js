import api from "../api/axios";

// Resumen de actividades personales
export const obtenerResumenPersonal = async () => {
  const response = await api.get("/reportes/resumen");
  return response.data;
};

// Historial personal por fechas
export const obtenerHistorialPersonal = async (desde, hasta) => {
  const response = await api.get("/reportes/historial", {
    params: { desde, hasta },
  });

  return response.data;
};

// Resumen de un proyecto
export const obtenerReporteProyecto = async (proyectoId, desde, hasta) => {
  const response = await api.get(`/reportes/proyectos/${proyectoId}`, {
    params: { desde, hasta },
  });

  return response.data;
};

// Estadísticas por integrante de un proyecto
export const obtenerReporteMiembros = async (proyectoId, desde, hasta) => {
  const response = await api.get(`/reportes/proyectos/${proyectoId}/miembros`, {
    params: { desde, hasta },
  });

  return response.data;
};
