
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import FormLogin from "./pages/auth/FormLogin";
import FormRegister from "./pages/auth/FormRegister";

import Dashboard from "./pages/dashboard/Dashboard";

import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

import { Container } from "react-bootstrap";

const PaginaPendiente = ({ titulo }) => (
  <Container className="py-5">
    <h2>{titulo}</h2>
    <p className="text-muted">
      Este módulo se implementará en la siguiente etapa.
    </p>
  </Container>
);

const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="/login"
        element={<FormLogin />}
      />

      <Route
        path="/register"
        element={<FormRegister />}
      />

      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/actividades"
            element={
              <PaginaPendiente titulo="Mis actividades" />
            }
          />

          <Route
            path="/proyectos"
            element={
              <PaginaPendiente titulo="Mis proyectos" />
            }
          />

          <Route
            path="/gamificacion"
            element={
              <PaginaPendiente titulo="Gamificación" />
            }
          />

          <Route
            path="/ranking"
            element={
              <PaginaPendiente titulo="Ranking" />
            }
          />

          <Route
            path="/reportes"
            element={
              <PaginaPendiente titulo="Reportes" />
            }
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
};

export default App;
