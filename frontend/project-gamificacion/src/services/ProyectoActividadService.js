import api from "../api/axios";

// LISTAR ACTIVIDADES DE UN PROYECTO
export const obtenerActividadesProyecto = async (proyectoId) => {
  const response = await api.get(`/proyectos/${proyectoId}/actividades`);

  return response.data;
};

// CREAR ACTIVIDAD EN UN PROYECTO
export const crearActividadProyecto = async (proyectoId, datos) => {
  const response = await api.post(
    `/proyectos/${proyectoId}/actividades`,
    datos,
  );

  return response.data;
};

// ASIGNAR ACTIVIDAD A UN INTEGRANTE
export const asignarActividadProyecto = async (
  proyectoId,
  actividadId,
  usuarioId,
) => {
  const response = await api.put(
    `/proyectos/${proyectoId}/actividades/${actividadId}/asignar`,
    { usuarioId },
  );

  return response.data;
};

// COMPLETAR ACTIVIDAD DEL PROYECTO
export const completarActividadProyecto = async (proyectoId, actividadId) => {
  const response = await api.post(
    `/proyectos/${proyectoId}/actividades/${actividadId}/completar`,
  );

  return response.data;
};
