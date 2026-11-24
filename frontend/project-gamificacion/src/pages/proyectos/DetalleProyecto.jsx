
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useSelector } from "react-redux";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Form,
  Table,
  Spinner,
} from "react-bootstrap";

import {
  ArrowLeft,
  UserPlus,
  Trash2,
  Pencil,
  Users,
  ListTodo,
} from "lucide-react";

import {
  obtenerProyecto,
  agregarMiembro,
  eliminarMiembro,
  eliminarProyecto,
} from "../../services/ProyectoService";

const DetalleProyecto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const usuario = useSelector(
    (state) => state.auth.usuario
  );

  const [proyecto, setProyecto] = useState(null);
  const [miembros, setMiembros] = useState([]);

  const [email, setEmail] = useState("");

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [actualizacion, setActualizacion] = useState(0);

  // NUEVO: VALIDACIÓN DEL CORREO
  const [emailTocado, setEmailTocado] = useState(false);
  const [intentadoAgregar, setIntentadoAgregar] =
    useState(false);

  const errorEmail =
    email.trim() === ""
      ? "El correo electrónico es obligatorio."
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email.trim()
        )
        ? "Ingresa un correo electrónico válido."
        : "";

  const mostrarValidacion =
    emailTocado || intentadoAgregar;

  const emailValido =
    mostrarValidacion && !errorEmail;

  const emailInvalido =
    mostrarValidacion && Boolean(errorEmail);

  // CARGAR PROYECTO
  useEffect(() => {
    let activo = true;

    obtenerProyecto(id)
      .then((respuesta) => {
        if (!activo) return;

        setProyecto(respuesta.proyecto);
        setMiembros(respuesta.miembros || []);
        setError("");
      })
      .catch((err) => {
        if (activo) {
          setError(
            err.response?.data?.mensaje ||
              "No se pudo obtener el proyecto"
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
    Number(proyecto?.propietarioId) ===
    Number(usuario?.id);

  // AGREGAR INTEGRANTE
  const onAgregarMiembro = async (event) => {
    event.preventDefault();

    if (procesando || !esPropietario) return;

    setIntentadoAgregar(true);
    setError("");
    setMensaje("");

    if (errorEmail) {
      return;
    }

    setProcesando(true);

    try {
      await agregarMiembro(id, email.trim());

      setEmail("");
      setEmailTocado(false);
      setIntentadoAgregar(false);

      setMensaje(
        "Miembro agregado correctamente"
      );

      actualizar();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo agregar el miembro"
      );
    } finally {
      setProcesando(false);
    }
  };

  // RETIRAR INTEGRANTE
  const onEliminarMiembro = async (miembro) => {
    if (procesando || !esPropietario) return;

    const confirmar = window.confirm(
      `¿Quieres retirar a ${miembro.nombreCompleto} del proyecto?`
    );

    if (!confirmar) return;

    setProcesando(true);
    setError("");
    setMensaje("");

    try {
      await eliminarMiembro(id, miembro.id);

      setMensaje(
        "Miembro retirado correctamente"
      );

      actualizar();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo retirar el miembro"
      );
    } finally {
      setProcesando(false);
    }
  };

  // ELIMINAR PROYECTO
  const onEliminarProyecto = async () => {
    if (procesando || !esPropietario) return;

    const confirmar = window.confirm(
      "¿Quieres eliminar este proyecto? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setProcesando(true);
    setError("");

    try {
      await eliminarProyecto(id);

      navigate("/proyectos", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo eliminar el proyecto"
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
          Cargando proyecto...
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
          Volver
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Link
        to="/proyectos"
        className="text-decoration-none d-inline-flex align-items-center gap-2 mb-3"
      >
        <ArrowLeft size={18} />
        Volver a proyectos
      </Link>

      <Row className="g-3 mb-4">
        <Col>
          <h2 className="fw-bold">
            {proyecto.nombre}
          </h2>

          <p className="text-muted">
            {proyecto.descripcion ||
              "Sin descripción"}
          </p>

          <Badge
            bg={
              proyecto.estado === "ACTIVO"
                ? "success"
                : "secondary"
            }
          >
            {proyecto.estado}
          </Badge>

          {/* VER ACTIVIDADES PARA TODOS LOS MIEMBROS */}
          <div className="mt-3">
            <Button
              as={Link}
              to={`/proyectos/${id}/actividades`}
              variant="primary"
              className="d-inline-flex align-items-center gap-2"
            >
              <ListTodo size={18} />
              Ver actividades del proyecto
            </Button>
          </div>
        </Col>

        {esPropietario && (
          <Col xs="auto">
            <Button
              as={Link}
              to={`/proyectos/${id}/editar`}
              variant="outline-primary"
              className="me-2"
            >
              <Pencil
                size={16}
                className="me-1"
              />
              Editar
            </Button>

            <Button
              variant="outline-danger"
              disabled={procesando}
              onClick={onEliminarProyecto}
            >
              <Trash2
                size={16}
                className="me-1"
              />
              Eliminar
            </Button>
          </Col>
        )}
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

      <Row className="g-3">
        {/* TABLA DE INTEGRANTES */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">
                <Users
                  size={20}
                  className="me-2"
                />
                Integrantes ({miembros.length})
              </h5>

              <Table
                responsive
                hover
                className="align-middle"
              >
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>

                    {esPropietario && (
                      <th>Acciones</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {miembros.map((miembro) => (
                    <tr key={miembro.id}>
                      <td>
                        {miembro.nombreCompleto}
                      </td>

                      <td>{miembro.email}</td>

                      <td>
                        <Badge
                          bg={
                            miembro.ProyectoUsuario
                              ?.rol === "ADMIN"
                              ? "primary"
                              : "secondary"
                          }
                        >
                          {miembro.ProyectoUsuario
                            ?.rol || "MIEMBRO"}
                        </Badge>
                      </td>

                      {esPropietario && (
                        <td>
                          {Number(miembro.id) !==
                            Number(
                              proyecto.propietarioId
                            ) && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              disabled={procesando}
                              onClick={() =>
                                onEliminarMiembro(
                                  miembro
                                )
                              }
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>

              {miembros.length === 0 && (
                <p className="text-muted">
                  No hay integrantes registrados.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {esPropietario &&
          proyecto.estado === "ACTIVO" ? (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5>
                  <UserPlus
                    size={20}
                    className="me-2"
                  />
                  Agregar integrante
                </h5>

                <p className="text-muted small">
                  El usuario debe estar registrado
                  previamente en el sistema.
                </p>

                {/* FORMULARIO VALIDADO */}
                <Form
                  noValidate
                  onSubmit={onAgregarMiembro}
                >
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Correo electrónico
                    </Form.Label>

                    <Form.Control
                      type="email"
                      required
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      onBlur={() =>
                        setEmailTocado(true)
                      }
                      placeholder="usuario@ejemplo.com"
                      isValid={emailValido}
                      isInvalid={emailInvalido}
                    />

                    <Form.Control.Feedback type="valid">
                      Correo válido.
                    </Form.Control.Feedback>

                    <Form.Control.Feedback type="invalid">
                      {errorEmail}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100"
                    disabled={procesando}
                  >
                    {procesando
                      ? "Agregando..."
                      : "Agregar integrante"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5>Información</h5>

                <p className="text-muted mb-0">
                  {proyecto.estado === "FINALIZADO"
                    ? "Este proyecto está finalizado."
                    : "Solo el propietario administra los integrantes."}
                </p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DetalleProyecto;
