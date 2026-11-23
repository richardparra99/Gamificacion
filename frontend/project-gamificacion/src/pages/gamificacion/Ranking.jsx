
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Alert,
  Button,
  Spinner,
} from "react-bootstrap";

import {
  Trophy,
  Medal,
  RefreshCw,
  Users,
} from "lucide-react";

import {
  obtenerRanking,
} from "../../services/GamificacionService";

const Ranking = () => {
  const usuario = useSelector(
    (state) => state.auth.usuario
  );

  const [ranking, setRanking] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizacion, setActualizacion] = useState(0);

  useEffect(() => {
    let activo = true;

    obtenerRanking()
      .then((respuesta) => {
        if (!activo) return;

        setRanking(respuesta.ranking || []);
        setError("");
      })
      .catch((err) => {
        if (activo) {
          setError(
            err.response?.data?.mensaje ||
              "No se pudo cargar el ranking"
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
    if (cargando) return;

    setCargando(true);
    setActualizacion((anterior) => anterior + 1);
  };

  const posicionUsuario = ranking.find(
    (item) =>
      Number(item.usuarioId) === Number(usuario?.id)
  );

  const iconoPosicion = (posicion) => {
    if (posicion <= 3) {
      return (
        <Medal
          size={22}
          className={
            posicion === 1
              ? "text-warning"
              : posicion === 2
                ? "text-secondary"
                : "text-danger"
          }
        />
      );
    }

    return <span>{posicion}</span>;
  };

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="fw-bold mb-1">
            <Trophy
              size={27}
              className="text-warning me-2"
            />
            Ranking de usuarios
          </h2>

          <p className="text-muted mb-0">
            Clasificación por experiencia acumulada.
          </p>
        </Col>

        <Col xs="auto">
          <Button
            variant="outline-primary"
            disabled={cargando}
            onClick={actualizar}
          >
            <RefreshCw size={17} className="me-2" />
            Actualizar
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">
            Cargando clasificación...
          </p>
        </div>
      ) : (
        <>
          <Row className="g-3 mb-4">
            <Col md={6}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <Users className="text-primary mb-2" />
                  <p className="text-muted mb-1">
                    Usuarios registrados
                  </p>
                  <h3>{ranking.length}</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <Trophy className="text-warning mb-2" />
                  <p className="text-muted mb-1">
                    Mi posición
                  </p>
                  <h3>
                    {posicionUsuario
                      ? `#${posicionUsuario.posicion}`
                      : "Sin posición"}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="fw-bold mb-3">
                Tabla de clasificación
              </h5>

              {ranking.length === 0 ? (
                <p className="text-muted">
                  No hay usuarios para mostrar.
                </p>
              ) : (
                <Table
                  responsive
                  hover
                  className="align-middle"
                >
                  <thead>
                    <tr>
                      <th>Posición</th>
                      <th>Usuario</th>
                      <th>XP</th>
                      <th>Nivel</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ranking.map((item) => {
                      const soyYo =
                        Number(item.usuarioId) ===
                        Number(usuario?.id);

                      return (
                        <tr
                          key={item.usuarioId}
                          className={
                            soyYo ? "table-primary" : ""
                          }
                        >
                          <td>
                            {iconoPosicion(
                              item.posicion
                            )}
                          </td>

                          <td>
                            <strong>
                              {item.nombreCompleto}
                            </strong>

                            {soyYo && (
                              <Badge
                                bg="primary"
                                className="ms-2"
                              >
                                Tú
                              </Badge>
                            )}
                          </td>

                          <td>
                            <Badge bg="success">
                              {item.experiencia} XP
                            </Badge>
                          </td>

                          <td>
                            Nivel {item.nivel}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default Ranking;
