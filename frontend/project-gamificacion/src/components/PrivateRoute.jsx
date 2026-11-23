
import { useEffect, useState } from "react";

import { Navigate, Outlet } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import {
  establecerUsuario,
  cerrarSesion,
} from "../features/auth/authSlice";

import {
  obtenerUsuario,
} from "../services/AuthService";

const PrivateRoute = () => {
  const dispatch = useDispatch();

  const { token, autenticado } = useSelector(
    (state) => state.auth
  );

  const [verificando, setVerificando] = useState(
    Boolean(token) && !autenticado
  );

  useEffect(() => {
    if (!token || autenticado) return;

    let activo = true;

    obtenerUsuario()
      .then((respuesta) => {
        if (activo) {
          dispatch(establecerUsuario(respuesta.usuario));
        }
      })
      .catch(() => {
        if (activo) {
          dispatch(cerrarSesion());
        }
      })
      .finally(() => {
        if (activo) setVerificando(false);
      });

    return () => {
      activo = false;
    };
  }, [token, autenticado, dispatch]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (verificando && !autenticado) {
    return (
      <div className="container py-5 text-center">
        Verificando sesión...
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
