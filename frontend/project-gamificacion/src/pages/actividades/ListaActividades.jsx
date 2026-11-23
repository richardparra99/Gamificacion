import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";

import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import {
  obtenerActividades,
  completarActividad,
  eliminarActividad,
} from "../../services/ActividadService";

const ListaActividades = () => {
  const [actividades, setActividades] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Cambiar este valor provoca una nueva consulta
  const [actualizacion, setActualizacion] = useState(0);

  // CARGAR ACTIVIDADES DESDE EL BACKEND
  useEffect(() => {
    let activo = true;

    obtenerActividades()
      .then((respuesta) => {
        if (activo) {
          setActividades(respuesta.actividades || []);
        }
      })
      .catch((err) => {
        if (activo) {
          setError(
            err.response?.data?.mensaje ||
              "No se pudieron cargar las actividades"
          );
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [actualizacion]);

  // SOLICITAR UNA NUEVA CONSULTA
  const cargarActividades = () => {
    setActualizacion((anterior) => anterior + 1);
  };

  // ACTUALIZAR MANUALMENTE
  const onActualizar = () => {
    if (cargando || procesandoId !== null) return;

    setError("");
    setMensaje("");
    setCargando(true);
    cargarActividades();
  };

  // COMPLETAR ACTIVIDAD Y RECIBIR XP
  const onCompletar = async (actividad) => {
    if (procesandoId !== null) return;

    try {
      setProcesandoId(actividad.id);
      setError("");
      setMensaje("");

      const resultado = await completarActividad(
        actividad.id
      );

      const puntos =
        resultado.recompensa?.puntosGanados ?? 0;

      const logros =
        resultado.recompensa?.logrosDesbloqueados ?? [];

      let texto =
        `Actividad registrada correctamente. +${puntos} XP`;

      if (logros.length > 0) {
        texto += ` | Nuevo logro: ${logros
          .map((logro) => logro.nombre)
          .join(", ")}`;
      }

      setMensaje(texto);

      // Recargar la lista después del cumplimiento
      cargarActividades();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo completar la actividad"
      );
    } finally {
      setProcesandoId(null);
    }
  };

  // ELIMINAR ACTIVIDAD
  const onEliminar = async (actividad) => {
    if (procesandoId !== null) return;

    const confirmar = window.confirm(
      `¿Quieres eliminar "${actividad.titulo}"?`
    );

    if (!confirmar) return;

    try {
      setProcesandoId(actividad.id);
      setError("");
      setMensaje("");

      await eliminarActividad(actividad.id);

      setMensaje("Actividad eliminada correctamente");

      // Actualizar la tabla
      cargarActividades();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo eliminar la actividad"
      );
    } finally {
      setProcesandoId(null);
    }
  };

  // VERIFICAR SI UNA ACTIVIDAD PUEDE COMPLETARSE
  const puedeCompletar = (actividad) => {
    if (actividad.tipo === "RECURRENTE") {
      return true;
    }

    return actividad.estado !== "COMPLETADA";
  };

  // SOLO EDITAR O ELIMINAR SI NO HAY CUMPLIMIENTOS
  const puedeEditarEliminar = (actividad) =>
    !actividad.cumplimientos?.length;

  // MOSTRAR EL ESTADO DE UNA ACTIVIDAD
  const renderEstado = (actividad) => {
    if (actividad.tipo === "RECURRENTE") {
      return (
        <Badge bg="info" text="dark">
          Recurrente
        </Badge>
      );
    }

    if (actividad.estado === "COMPLETADA") {
      return (
        <Badge bg="success">
          Completada
        </Badge>
      );
    }

    return (
      <Badge bg="warning" text="dark">
        Pendiente
      </Badge>
    );
  };

  return (
    <Container className="py-4">
      {/* ENCABEZADO */}
      <Row className="align-items-center mb-4 g-3">
        <Col>
          <h2 className="fw-bold mb-1">
            Mis actividades
          </h2>

          <p className="text-muted mb-0">
            Organiza tus tareas y gana experiencia.
          </p>
        </Col>

        <Col xs="auto">
          <Button
            as={Link}
            to="/actividades/nueva"
            className="d-flex align-items-center gap-2"
          >
            <Plus size={18} />
            Nueva actividad
          </Button>
        </Col>
      </Row>

      {/* MENSAJES */}
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {mensaje && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setMensaje("")}
        >
          {mensaje}
        </Alert>
      )}

      {/* LISTADO */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              Actividades registradas
            </h5>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onActualizar}
              disabled={cargando || procesandoId !== null}
              title="Actualizar actividades"
            >
              <RefreshCw size={16} />
            </Button>
          </div>

          {cargando ? (
            <div className="text-center py-5">
              <Spinner animation="border" />

              <p className="text-muted mt-3">
                Cargando actividades...
              </p>
            </div>
          ) : actividades.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">
                Todavía no tienes actividades.
              </p>

              <Button
                as={Link}
                to="/actividades/nueva"
              >
                Crear mi primera actividad
              </Button>
            </div>
          ) : (
            <Table
              responsive
              hover
              className="align-middle"
            >
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th>Tipo</th>
                  <th>Fecha límite</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {actividades.map((actividad) => (
                  <tr key={actividad.id}>
                    <td>
                      <strong>
                        {actividad.titulo}
                      </strong>

                      {actividad.descripcion && (
                        <div className="text-muted small">
                          {actividad.descripcion}
                        </div>
                      )}
                    </td>

                    <td>
                      {actividad.tipo === "UNICA"
                        ? "Única"
                        : `Recurrente - ${actividad.frecuencia}`}
                    </td>

                    <td>
                      {actividad.fechaLimite || "Sin fecha"}
                    </td>

                    <td>
                      {renderEstado(actividad)}
                    </td>

                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        {/* COMPLETAR */}
                        {puedeCompletar(actividad) && (
                          <Button
                            size="sm"
                            variant="success"
                            disabled={procesandoId !== null}
                            onClick={() =>
                              onCompletar(actividad)
                            }
                            title="Completar actividad"
                          >
                            <CheckCircle2 size={16} />
                          </Button>
                        )}

                        {/* EDITAR Y ELIMINAR */}
                        {puedeEditarEliminar(actividad) && (
                          <>
                            <Button
                              as={Link}
                              to={`/actividades/${actividad.id}/editar`}
                              variant="outline-primary"
                              size="sm"
                              title="Editar actividad"
                            >
                              <Pencil size={16} />
                            </Button>

                            <Button
                              variant="outline-danger"
                              size="sm"
                              disabled={procesandoId !== null}
                              onClick={() =>
                                onEliminar(actividad)
                              }
                              title="Eliminar actividad"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ListaActividades;
