import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";

import { iniciarSesion, cerrarSesion } from "../features/auth/authSlice";

import { login, register } from "../services/AuthService";

const useAuthentication = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { usuario, token, autenticado } = useSelector((state) => state.auth);

  const doLogin = async (loginData) => {
    const resultado = await login(loginData);

    dispatch(
      iniciarSesion({
        usuario: resultado.usuario,
        token: resultado.token,
      }),
    );

    navigate("/dashboard", { replace: true });

    return resultado;
  };

  const doRegister = async (registerData) => {
    const resultado = await register(registerData);

    dispatch(
      iniciarSesion({
        usuario: resultado.usuario,
        token: resultado.token,
      }),
    );

    navigate("/dashboard", { replace: true });

    return resultado;
  };

  const doLogout = () => {
    dispatch(cerrarSesion());

    navigate("/login", { replace: true });
  };

  return {
    usuario,
    token,
    autenticado,
    doLogin,
    doRegister,
    doLogout,
  };
};

export default useAuthentication;
