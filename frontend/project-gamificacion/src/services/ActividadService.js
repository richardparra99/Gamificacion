import api from "../api/axios";

// Obtener las actividades del usuario autenticado
const obtenerActividades = async () => {
  const response = await api.get("/actividades");
  return response.data;
};

// Obtener una actividad por su ID
const obtenerActividad = async (id) => {
  const response = await api.get(`/actividades/${id}`);
  return response.data;
};

// Crear una actividad
const crearActividad = async (datos) => {
  const response = await api.post("/actividades", datos);
  return response.data;
};

// Actualizar una actividad
const actualizarActividad = async (id, datos) => {
  const response = await api.put(`/actividades/${id}`, datos);

  return response.data;
};

// Completar una actividad y recibir XP
const completarActividad = async (id) => {
  const response = await api.post(`/actividades/${id}/completar`);

  return response.data;
};

// Eliminar una actividad sin historial
const eliminarActividad = async (id) => {
  const response = await api.delete(`/actividades/${id}`);

  return response.data;
};

// Consultar historial de cumplimientos
const obtenerHistorial = async (id) => {
  const response = await api.get(`/actividades/${id}/historial`);

  return response.data;
};

export {
  obtenerActividades,
  obtenerActividad,
  crearActividad,
  actualizarActividad,
  completarActividad,
  eliminarActividad,
  obtenerHistorial,
};
