import api from "../api/axios";

// Consultar XP, nivel y logros del usuario
export const obtenerPerfilGamificacion = async () => {
  const response = await api.get("/gamificacion/me");
  return response.data;
};

// Consultar historial de puntos
export const obtenerHistorialPuntos = async () => {
  const response = await api.get("/gamificacion/historial");
  return response.data;
};

// Consultar clasificación de usuarios
export const obtenerRanking = async () => {
  const response = await api.get("/gamificacion/ranking");
  return response.data;
};
