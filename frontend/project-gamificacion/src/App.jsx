
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// AUTENTICACIÓN
import FormLogin from "./pages/auth/FormLogin";
import FormRegister from "./pages/auth/FormRegister";

// DASHBOARD
import Dashboard from "./pages/dashboard/Dashboard";

// ACTIVIDADES PERSONALES
import ListaActividades from "./pages/actividades/ListaActividades";
import FormActividad from "./pages/actividades/FormActividad";

// PROYECTOS
import ListaProyectos from "./pages/proyectos/ListaProyectos";
import FormProyecto from "./pages/proyectos/FormProyecto";
import DetalleProyecto from "./pages/proyectos/DetalleProyecto";

// ACTIVIDADES COLABORATIVAS
import ActividadesProyecto from "./pages/proyectos/ActividadesProyecto";

// GAMIFICACIÓN
import PerfilGamificacion from "./pages/gamificacion/PerfilGamificacion";
import Ranking from "./pages/gamificacion/Ranking";

// REPORTES - NUEVO
import Reportes from "./pages/reportes/Reportes";
import ReporteProyecto from "./pages/reportes/ReporteProyecto";

// COMPONENTES COMPARTIDOS
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

const App = () => {
  return (
    <Routes>
      {/* INICIO */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* AUTENTICACIÓN */}
      <Route
        path="/login"
        element={<FormLogin />}
      />

      <Route
        path="/register"
        element={<FormRegister />}
      />

      {/* RUTAS PROTEGIDAS */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* ACTIVIDADES PERSONALES */}
          <Route
            path="/actividades"
            element={<ListaActividades />}
          />

          <Route
            path="/actividades/nueva"
            element={<FormActividad />}
          />

          <Route
            path="/actividades/:id/editar"
            element={<FormActividad />}
          />

          {/* PROYECTOS */}
          <Route
            path="/proyectos"
            element={<ListaProyectos />}
          />

          <Route
            path="/proyectos/nuevo"
            element={<FormProyecto />}
          />

          <Route
            path="/proyectos/:id/editar"
            element={<FormProyecto />}
          />

          <Route
            path="/proyectos/:id"
            element={<DetalleProyecto />}
          />

          {/* ACTIVIDADES COLABORATIVAS */}
          <Route
            path="/proyectos/:id/actividades"
            element={<ActividadesProyecto />}
          />

          {/* GAMIFICACIÓN */}
          <Route
            path="/gamificacion"
            element={<PerfilGamificacion />}
          />

          <Route
            path="/ranking"
            element={<Ranking />}
          />

          {/* REPORTES */}
          <Route
            path="/reportes"
            element={<Reportes />}
          />

          <Route
            path="/reportes/proyectos/:id"
            element={<ReporteProyecto />}
          />

        </Route>
      </Route>

      {/* URL NO ENCONTRADA */}
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
};

export default App;
