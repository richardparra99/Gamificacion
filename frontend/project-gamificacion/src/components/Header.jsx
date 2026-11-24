
import {
  Container,
  Navbar,
  Nav,
  Button,
} from "react-bootstrap";

import { NavLink } from "react-router-dom";

import useAuthentication from "../hooks/useAuthentication";

const Header = () => {
  const { usuario, doLogout } = useAuthentication();

  // Color principal del Header
  const colorHeader = "#142D4E";

  // Estilos para las opciones de navegación
  const estiloEnlace = ({ isActive }) => ({
    color: isActive ? "#FFFFFF" : "#D9E5F2",
    backgroundColor: isActive
      ? "#285278"
      : "transparent",
    borderRadius: "8px",
    padding: "8px 12px",
    fontWeight: isActive ? "600" : "400",
    transition: "all 0.2s ease",
    textDecoration: "none",
    display: "block",
  });

  const enlaces = [
    { ruta: "/dashboard", nombre: "Dashboard" },
    { ruta: "/actividades", nombre: "Actividades" },
    { ruta: "/proyectos", nombre: "Proyectos" },
    { ruta: "/gamificacion", nombre: "Mis puntos" },
    { ruta: "/ranking", nombre: "Ranking" },
    { ruta: "/reportes", nombre: "Reportes" },
  ];

  return (
    <Navbar
      expand="lg"
      data-bs-theme="dark"
      className="shadow-sm py-3"
      style={{
        backgroundColor: colorHeader,
      }}
    >
      <Container>
        {/* LOGO */}
        <Navbar.Brand
          as={NavLink}
          to="/dashboard"
          className="fw-bold text-white"
          style={{
            fontSize: "1.4rem",
            letterSpacing: "0.5px",
          }}
        >
          MiniJira
        </Navbar.Brand>

        {/* MENÚ RESPONSIVE */}
        <Navbar.Toggle aria-controls="menu" />

        <Navbar.Collapse id="menu">
          {/* OPCIONES DEL MENÚ */}
          <Nav className="me-auto align-items-lg-center gap-lg-1">
            {enlaces.map((enlace) => (
              <Nav.Link
                key={enlace.ruta}
                as={NavLink}
                to={enlace.ruta}
                end={
                  enlace.ruta === "/dashboard"
                }
                style={estiloEnlace}
                className="mini-jira-nav-link"
              >
                {enlace.nombre}
              </Nav.Link>
            ))}
          </Nav>

          {/* USUARIO Y CERRAR SESIÓN */}
          <div className="d-flex flex-wrap align-items-center gap-3 mt-3 mt-lg-0">
            <span
              className="text-white small"
              style={{
                fontWeight: "500",
              }}
            >
              {usuario?.nombreCompleto}
            </span>

            <Button
              variant="outline-light"
              size="sm"
              onClick={doLogout}
              style={{
                borderRadius: "8px",
                fontWeight: "500",
              }}
            >
              Cerrar sesión
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>

      {/* ESTILOS DEL EFECTO HOVER */}
      <style>
        {`
          .mini-jira-nav-link:hover {
            background-color: #285278 !important;
            color: #FFFFFF !important;
          }

          .mini-jira-nav-link:focus-visible {
            outline: 2px solid #FFFFFF;
            outline-offset: 2px;
          }
        `}
      </style>
    </Navbar>
  );
};

export default Header;
