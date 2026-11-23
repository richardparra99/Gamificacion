
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";

import {
  FolderKanban,
  Plus,
  Eye,
  Pencil,
  RefreshCw,
} from "lucide-react";

import { obtenerProyectos } from "../../services/ProyectoService";

const ListaProyectos = () => {
  const usuario = useSelector((state) => state.auth.usuario);

  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizacion, setActualizacion] = useState(0);

  useEffect(() => {
    let activo = true;

    obtenerProyectos()
      .then((respuesta) => {
        if (activo) {
          setProyectos(respuesta.proyectos || []);
          setError("");
        }
      })
      .catch((err) => {
        if (activo) {
          setError(
            err.response?.data?.mensaje ||
              "No se pudieron obtener los proyectos"
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [actualizacion]);

  const actualizar = () => {
    setCargando(true);
    setActualizacion((anterior) => anterior + 1);
  };

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4 g-3">
        <Col>
          <h2 className="fw-bold mb-1">Mis proyectos</h2>
          <p className="text-muted mb-0">
            Organiza actividades y colabora con tu equipo.
          </p>
        </Col>

        <Col xs="auto">
          <Button as={Link} to="/proyectos/nuevo">
            <Plus size={18} className="me-2" />
            Nuevo proyecto
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Proyectos registrados</h5>

        <Button
          variant="outline-secondary"
          size="sm"
          disabled={cargando}
          onClick={actualizar}
        >
          <RefreshCw size={16} className="me-1" />
          Actualizar
        </Button>
      </div>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Cargando proyectos...</p>
        </div>
      ) : proyectos.length === 0 ? (
        <Card className="border-0 shadow-sm text-center">
          <Card.Body className="py-5">
            <FolderKanban
              size={42}
              className="text-primary mb-3"
            />

            <h5>Todavía no tienes proyectos</h5>

            <p className="text-muted">
              Crea un proyecto para empezar a trabajar
              con otros integrantes.
            </p>

            <Button as={Link} to="/proyectos/nuevo">
              Crear proyecto
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {proyectos.map((proyecto) => {
            const esPropietario =
              Number(proyecto.propietarioId) ===
              Number(usuario?.id);

            return (
              <Col md={6} lg={4} key={proyecto.id}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <FolderKanban
                        size={28}
                        className="text-primary"
                      />

                      <Badge
                        bg={
                          proyecto.estado === "ACTIVO"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {proyecto.estado}
                      </Badge>
                    </div>

                    <h5 className="fw-bold">
                      {proyecto.nombre}
                    </h5>

                    <p className="text-muted flex-grow-1">
                      {proyecto.descripcion ||
                        "Sin descripción"}
                    </p>

                    <p className="small text-muted">
                      Rol:{" "}
                      {esPropietario
                        ? "Administrador"
                        : proyecto.ProyectoUsuario?.rol ||
                          "Miembro"}
                    </p>

                    <div className="d-flex gap-2">
                      <Button
                        as={Link}
                        to={`/proyectos/${proyecto.id}`}
                        size="sm"
                        variant="primary"
                      >
                        <Eye size={16} className="me-1" />
                        Ver
                      </Button>

                      {esPropietario && (
                        <Button
                          as={Link}
                          to={`/proyectos/${proyecto.id}/editar`}
                          size="sm"
                          variant="outline-secondary"
                        >
                          <Pencil
                            size={16}
                            className="me-1"
                          />
                          Editar
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default ListaProyectos;
