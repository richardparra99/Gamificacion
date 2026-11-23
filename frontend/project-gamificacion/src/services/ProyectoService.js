import api from "../api/axios";

// Obtener proyectos del usuario autenticado
export const obtenerProyectos = async () => {
  const response = await api.get("/proyectos");
  return response.data;
};

// Obtener información y miembros del proyecto
export const obtenerProyecto = async (id) => {
  const response = await api.get(`/proyectos/${id}`);
  return response.data;
};

// Crear proyecto
export const crearProyecto = async (datos) => {
  const response = await api.post("/proyectos", datos);
  return response.data;
};

// Editar proyecto
export const actualizarProyecto = async (id, datos) => {
  const response = await api.put(`/proyectos/${id}`, datos);
  return response.data;
};

// Eliminar proyecto
export const eliminarProyecto = async (id) => {
  const response = await api.delete(`/proyectos/${id}`);
  return response.data;
};

// Agregar miembro mediante correo electrónico
export const agregarMiembro = async (proyectoId, email) => {
  const response = await api.post(`/proyectos/${proyectoId}/miembros`, {
    email,
  });

  return response.data;
};

// Retirar miembro
export const eliminarMiembro = async (proyectoId, usuarioId) => {
  const response = await api.delete(
    `/proyectos/${proyectoId}/miembros/${usuarioId}`,
  );

  return response.data;
};
