
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  Alert,
  Spinner,
  Table,
} from "react-bootstrap";

import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import { obtenerProyecto } from "../../services/ProyectoService";

import {
  obtenerActividadesProyecto,
  crearActividadProyecto,
  asignarActividadProyecto,
  completarActividadProyecto,
} from "../../services/ProyectoActividadService";

const datosIniciales = {
  titulo: "",
  descripcion: "",
  tipo: "UNICA",
  frecuencia: "",
  fechaLimite: "",
};

const ActividadesProyecto = () => {
  const { id } = useParams();

  const usuario = useSelector(
    (state) => state.auth.usuario
  );

  const [proyecto, setProyecto] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [actividades, setActividades] = useState([]);

  const [datos, setDatos] = useState(datosIniciales);
  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [actualizacion, setActualizacion] = useState(0);

  // CARGAR PROYECTO, MIEMBROS Y ACTIVIDADES
  useEffect(() => {
    let activo = true;

    Promise.all([
      obtenerProyecto(id),
      obtenerActividadesProyecto(id),
    ])
      .then(([respuestaProyecto, respuestaActividades]) => {
        if (!activo) return;

        setProyecto(respuestaProyecto.proyecto);
        setMiembros(respuestaProyecto.miembros || []);

        setActividades(
          respuestaActividades.actividades || []
        );
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
  }, [id, actualizacion]);

  const actualizar = () => {
    setActualizacion((anterior) => anterior + 1);
  };

  const esPropietario =
    proyecto !== null &&
    Number(proyecto.propietarioId) ===
      Number(usuario?.id);

  const proyectoActivo = proyecto?.estado === "ACTIVO";

  const onChange = (event) => {
    const { name, value } = event.target;

    setDatos((anterior) => ({
      ...anterior,
      [name]: value,
      ...(name === "tipo" && value === "UNICA"
        ? { frecuencia: "" }
        : {}),
    }));
  };

  // CREAR ACTIVIDAD
  const onCrear = async (event) => {
    event.preventDefault();

    if (procesando || !proyectoActivo) return;

    if (
      datos.tipo === "RECURRENTE" &&
      !datos.frecuencia
    ) {
      setError("Selecciona una frecuencia");
      return;
    }

    setProcesando(true);
    setError("");
    setMensaje("");

    try {
      const payload = {
        titulo: datos.titulo.trim(),
        descripcion:
          datos.descripcion.trim() || null,
        tipo: datos.tipo,
        frecuencia:
          datos.tipo === "RECURRENTE"
            ? datos.frecuencia
            : null,
        fechaLimite: datos.fechaLimite || null,
      };

      await crearActividadProyecto(id, payload);

      setDatos({ ...datosIniciales });
      setMostrarFormulario(false);

      setMensaje("Actividad creada correctamente");
      actualizar();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo crear la actividad"
      );
    } finally {
      setProcesando(false);
    }
  };

  // ASIGNAR RESPONSABLE
  const onAsignar = async (actividadId, usuarioId) => {
    if (procesando || !esPropietario) return;

    setProcesando(true);
    setError("");
    setMensaje("");

    try {
      await asignarActividadProyecto(
        id,
        actividadId,
        Number(usuarioId)
      );

      setMensaje("Responsable asignado correctamente");
      actualizar();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo asignar la actividad"
      );
    } finally {
      setProcesando(false);
    }
  };

  // COMPLETAR ACTIVIDAD Y GANAR XP
  const onCompletar = async (actividad) => {
    if (procesando) return;

    setProcesando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await completarActividadProyecto(
        id,
        actividad.id
      );

      const puntos =
        respuesta.recompensa?.puntosGanados ?? 0;

      const logros =
        respuesta.recompensa?.logrosDesbloqueados ?? [];

      let texto = `Actividad completada. +${puntos} XP`;

      if (logros.length > 0) {
        texto += ` | Logro desbloqueado: ${logros
          .map((logro) => logro.nombre)
          .join(", ")}`;
      }

      setMensaje(texto);
      actualizar();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo completar la actividad"
      );
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">
          Cargando actividades del proyecto...
        </p>
      </Container>
    );
  }

  if (!proyecto) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error || "Proyecto no encontrado"}
        </Alert>
        <Button as={Link} to="/proyectos">
          Volver a proyectos
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Link
        to={`/proyectos/${id}`}
        className="text-decoration-none d-inline-flex gap-2 align-items-center mb-3"
      >
        <ArrowLeft size={18} />
        Volver al proyecto
      </Link>

      <Row className="align-items-center mb-4 g-3">
        <Col>
          <h2 className="fw-bold mb-1">
            Actividades del proyecto
          </h2>
          <p className="text-muted mb-0">
            {proyecto.nombre}
          </p>
        </Col>

        <Col xs="auto">
          <Button
            variant="outline-secondary"
            className="me-2"
            disabled={procesando || cargando}
            onClick={() => {
              setCargando(true);
              actualizar();
            }}
          >
            <RefreshCw size={17} />
          </Button>

          {proyectoActivo && (
            <Button
              onClick={() =>
                setMostrarFormulario((anterior) => !anterior)
              }
            >
              <Plus size={17} className="me-2" />
              Nueva actividad
            </Button>
          )}
        </Col>
      </Row>

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

      {mostrarFormulario && proyectoActivo && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <h5 className="mb-3">Crear actividad</h5>

            <Form onSubmit={onCrear}>
              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  name="titulo"
                  value={datos.titulo}
                  onChange={onChange}
                  required
                  minLength={3}
                  maxLength={150}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  name="descripcion"
                  as="textarea"
                  rows={2}
                  value={datos.descripcion}
                  onChange={onChange}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo</Form.Label>
                    <Form.Select
                      name="tipo"
                      value={datos.tipo}
                      onChange={onChange}
                    >
                      <option value="UNICA">Única</option>
                      <option value="RECURRENTE">
                        Recurrente
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {datos.tipo === "RECURRENTE" && (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Frecuencia</Form.Label>
                      <Form.Select
                        name="frecuencia"
                        value={datos.frecuencia}
                        onChange={onChange}
                        required
                      >
                        <option value="">
                          Seleccionar
                        </option>
                        <option value="DIARIA">Diaria</option>
                        <option value="SEMANAL">
                          Semanal
                        </option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Fecha límite</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaLimite"
                  value={datos.fechaLimite}
                  onChange={onChange}
                />
              </Form.Group>

              <Button
                type="submit"
                disabled={procesando}
              >
                {procesando
                  ? "Guardando..."
                  : "Crear actividad"}
              </Button>

              <Button
                type="button"
                variant="outline-secondary"
                className="ms-2"
                onClick={() => setMostrarFormulario(false)}
                disabled={procesando}
              >
                Cancelar
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">
            Actividades ({actividades.length})
          </h5>

          {actividades.length === 0 ? (
            <p className="text-muted">
              Este proyecto todavía no tiene actividades.
            </p>
          ) : (
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th>Tipo</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {actividades.map((actividad) => {
                  const esResponsable =
                    Number(actividad.asignadoAId) ===
                    Number(usuario?.id);

                  const completada =
                    actividad.tipo === "UNICA" &&
                    actividad.estado === "COMPLETADA";

                  return (
                    <tr key={actividad.id}>
                      <td>
                        <strong>{actividad.titulo}</strong>

                        {actividad.descripcion && (
                          <div className="text-muted small">
                            {actividad.descripcion}
                          </div>
                        )}

                        {actividad.fechaLimite && (
                          <div className="text-muted small">
                            Límite: {actividad.fechaLimite}
                          </div>
                        )}
                      </td>

                      <td>
                        {actividad.tipo === "UNICA"
                          ? "Única"
                          : `Recurrente: ${actividad.frecuencia}`}
                      </td>

                      <td>
                        {esPropietario &&
                        proyectoActivo &&
                        !completada ? (
                          <Form.Select
                            size="sm"
                            aria-label={`Responsable de ${actividad.titulo}`}
                            value={actividad.asignadoAId ?? ""}
                            disabled={procesando}
                            onChange={(event) =>
                              onAsignar(
                                actividad.id,
                                event.target.value
                              )
                            }
                          >
                            <option value="" disabled>
                              Seleccionar
                            </option>

                            {miembros.map((miembro) => (
                              <option
                                key={miembro.id}
                                value={miembro.id}
                              >
                                {miembro.nombreCompleto}
                              </option>
                            ))}
                          </Form.Select>
                        ) : (
                          actividad.responsable?.nombreCompleto ||
                          "Sin responsable"
                        )}
                      </td>

                      <td>
                        {completada ? (
                          <Badge bg="success">
                            Completada
                          </Badge>
                        ) : actividad.tipo === "RECURRENTE" ? (
                          <Badge bg="info" text="dark">
                            Recurrente
                          </Badge>
                        ) : (
                          <Badge bg="warning" text="dark">
                            Pendiente
                          </Badge>
                        )}
                      </td>

                      <td>
                        {esResponsable &&
                          proyectoActivo &&
                          !completada && (
                            <Button
                              size="sm"
                              variant="success"
                              disabled={procesando}
                              onClick={() =>
                                onCompletar(actividad)
                              }
                            >
                              <CheckCircle2
                                size={16}
                                className="me-1"
                              />
                              Completar
                            </Button>
                          )}

                        {!esResponsable && (
                          <span className="text-muted small">
                            Asignada a otro usuario
                          </span>
                        )}

                        {completada && (
                          <span className="text-success small">
                            Finalizada
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ActividadesProyecto;
