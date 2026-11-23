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

  return (
    <Navbar
      bg="dark"
      data-bs-theme="dark"
      expand="lg"
      className="shadow-sm"
    >
      <Container>
        <Navbar.Brand
          as={NavLink}
          to="/dashboard"
          className="fw-bold"
        >
          Gamificación
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="menu" />

        <Navbar.Collapse id="menu">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/dashboard">
              Dashboard
            </Nav.Link>

            <Nav.Link as={NavLink} to="/actividades">
              Actividades
            </Nav.Link>

            <Nav.Link as={NavLink} to="/proyectos">
              Proyectos
            </Nav.Link>

            <Nav.Link as={NavLink} to="/gamificacion">
              Mis puntos
            </Nav.Link>

            <Nav.Link as={NavLink} to="/ranking">
              Ranking
            </Nav.Link>

            <Nav.Link as={NavLink} to="/reportes">
              Reportes
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-3">
            <span className="text-white small">
              {usuario?.nombreCompleto}
            </span>

            <Button
              variant="outline-light"
              size="sm"
              onClick={doLogout}
            >
              Cerrar sesión
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
