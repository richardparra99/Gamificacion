import api from "../api/axios";

const login = async (loginData) => {
  const response = await api.post("/auth/login", loginData);

  return response.data;
};

const register = async (registerData) => {
  const response = await api.post("/auth/register", registerData);

  return response.data;
};

const obtenerUsuario = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

export { login, register, obtenerUsuario };
