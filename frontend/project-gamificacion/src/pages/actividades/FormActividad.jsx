
import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
  Link,
} from "react-router-dom";

import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";

import {
  crearActividad,
  obtenerActividad,
  actualizarActividad,
} from "../../services/ActividadService";

import {
  obtenerProyectos,
} from "../../services/ProyectoService";

import {
  crearActividadProyecto,
} from "../../services/ProyectoActividadService";

// DATOS INICIALES DEL FORMULARIO
const datosIniciales = {
  titulo: "",
  descripcion: "",
  tipo: "UNICA",
  frecuencia: "",
  fechaLimite: "",
};

const FormActividad = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Indica si estamos editando una actividad personal
  const esEdicion = Boolean(id);

  // DATOS DEL FORMULARIO
  const [datos, setDatos] = useState(datosIniciales);

  // DESTINO DE LA ACTIVIDAD
  const [destino, setDestino] = useState("PERSONAL");
  const [proyectoId, setProyectoId] = useState("");

  // PROYECTOS DISPONIBLES
  const [proyectos, setProyectos] = useState([]);

  // ESTADOS DE CARGA
  const [cargando, setCargando] = useState(esEdicion);
  const [cargandoProyectos, setCargandoProyectos] =
    useState(!esEdicion);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [errorProyectos, setErrorProyectos] = useState("");

  // ==========================================
  // CARGAR PROYECTOS DEL USUARIO
  // ==========================================
  useEffect(() => {
    // En edición solo trabajamos con actividades personales.
    if (esEdicion) return;

    let activo = true;

    obtenerProyectos()
      .then((respuesta) => {
        if (!activo) return;

        setProyectos(respuesta.proyectos || []);
        setErrorProyectos("");
      })
      .catch((err) => {
        if (!activo) return;

        setErrorProyectos(
          err.response?.data?.mensaje ||
            "No se pudieron cargar los proyectos"
        );
      })
      .finally(() => {
        if (activo) {
          setCargandoProyectos(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [esEdicion]);

  // ==========================================
  // CARGAR ACTIVIDAD PARA EDITAR
  // ==========================================
  useEffect(() => {
    if (!esEdicion) return;

    let activo = true;

    obtenerActividad(id)
      .then((respuesta) => {
        if (!activo) return;

        const actividad = respuesta.actividad;

        setDatos({
          titulo: actividad.titulo || "",
          descripcion: actividad.descripcion || "",
          tipo: actividad.tipo || "UNICA",
          frecuencia: actividad.frecuencia || "",
          fechaLimite: actividad.fechaLimite || "",
        });

        setDestino("PERSONAL");
      })
      .catch((err) => {
        if (!activo) return;

        setError(
          err.response?.data?.mensaje ||
            "No se pudo cargar la actividad"
        );
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [id, esEdicion]);

  // ==========================================
  // MANEJAR CAMBIOS DEL FORMULARIO
  // ==========================================
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

  // ==========================================
  // SELECCIONAR EL DESTINO
  // ==========================================
  const onCambiarDestino = (event) => {
    const nuevoDestino = event.target.value;

    setDestino(nuevoDestino);
    setProyectoId("");
    setError("");
  };

  // ==========================================
  // GUARDAR ACTIVIDAD
  // ==========================================
  const onSubmit = async (event) => {
    event.preventDefault();

    if (guardando) return;

    setError("");

    const titulo = datos.titulo.trim();

    if (titulo.length < 3) {
      setError(
        "El título debe tener al menos 3 caracteres."
      );
      return;
    }

    if (
      !esEdicion &&
      datos.tipo === "RECURRENTE" &&
      !datos.frecuencia
    ) {
      setError(
        "Debes seleccionar la frecuencia de la actividad."
      );
      return;
    }

    if (
      !esEdicion &&
      destino === "PROYECTO" &&
      !proyectoId
    ) {
      setError(
        "Debes seleccionar un proyecto."
      );
      return;
    }

    // Comprobar que el proyecto esté activo
    if (!esEdicion && destino === "PROYECTO") {
      const proyectoSeleccionado = proyectos.find(
        (proyecto) =>
          String(proyecto.id) === String(proyectoId)
      );

      if (
        !proyectoSeleccionado ||
        proyectoSeleccionado.estado !== "ACTIVO"
      ) {
        setError(
          "Selecciona un proyecto activo."
        );
        return;
      }
    }

    setGuardando(true);

    try {
      // CAMPOS COMPARTIDOS
      const payload = {
        titulo,
        descripcion:
          datos.descripcion.trim() || null,
        fechaLimite: datos.fechaLimite || null,
      };

      // ======================================
      // CASO 1: EDITAR ACTIVIDAD PERSONAL
      // ======================================
      if (esEdicion) {
        await actualizarActividad(id, payload);

        navigate("/actividades", {
          replace: true,
        });

        return;
      }

      // CAMPOS ADICIONALES PARA CREAR
      const datosCreacion = {
        ...payload,
        tipo: datos.tipo,
        frecuencia:
          datos.tipo === "RECURRENTE"
            ? datos.frecuencia
            : null,
      };

      // ======================================
      // CASO 2: CREAR ACTIVIDAD PERSONAL
      // ======================================
      if (destino === "PERSONAL") {
        await crearActividad(datosCreacion);

        navigate("/actividades", {
          replace: true,
        });

        return;
      }

      // ======================================
      // CASO 3: CREAR ACTIVIDAD DE PROYECTO
      // ======================================
      if (destino === "PROYECTO") {
        await crearActividadProyecto(
          proyectoId,
          datosCreacion
        );

        // Ir directamente a las actividades
        // del proyecto seleccionado
        navigate(
          `/proyectos/${proyectoId}/actividades`,
          { replace: true }
        );
      }
    } catch (err) {
      const detalles = err.response?.data;

      setError(
        detalles?.mensaje ||
          "No se pudo guardar la actividad"
      );
    } finally {
      setGuardando(false);
    }
  };

  // ==========================================
  // CARGANDO ACTIVIDAD
  // ==========================================
  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />

        <p className="mt-3">
          Cargando actividad...
        </p>
      </Container>
    );
  }

  const proyectosActivos = proyectos.filter(
    (proyecto) => proyecto.estado === "ACTIVO"
  );

  const rutaCancelar =
    !esEdicion &&
    destino === "PROYECTO" &&
    proyectoId
      ? `/proyectos/${proyectoId}/actividades`
      : "/actividades";

  // ==========================================
  // INTERFAZ
  // ==========================================
  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="fw-bold">
                {esEdicion
                  ? "Editar actividad"
                  : "Nueva actividad"}
              </h2>

              <p className="text-muted">
                {esEdicion
                  ? "Modifica los datos de tu actividad personal."
                  : "Crea una actividad personal o vincúlala a un proyecto."}
              </p>

              {/* ERRORES */}
              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              {/* FORMULARIO */}
              <Form onSubmit={onSubmit}>
                {/* ========================= */}
                {/* DESTINO DE LA ACTIVIDAD */}
                {/* ========================= */}
                {!esEdicion && (
                  <Card className="mb-4 bg-light border-0">
                    <Card.Body>
                      <h5 className="mb-3">
                        ¿Dónde deseas crear la actividad?
                      </h5>

                      <Form.Check
                        type="radio"
                        id="destino-personal"
                        name="destino"
                        label="Actividad personal"
                        value="PERSONAL"
                        checked={destino === "PERSONAL"}
                        onChange={onCambiarDestino}
                        className="mb-3"
                      />

                      <Form.Check
                        type="radio"
                        id="destino-proyecto"
                        name="destino"
                        label="Actividad de un proyecto"
                        value="PROYECTO"
                        checked={destino === "PROYECTO"}
                        onChange={onCambiarDestino}
                      />

                      {/* SELECCIONAR PROYECTO */}
                      {destino === "PROYECTO" && (
                        <div className="mt-3">
                          <Form.Group>
                            <Form.Label>
                              Seleccionar proyecto
                            </Form.Label>

                            {cargandoProyectos ? (
                              <div className="py-2">
                                <Spinner
                                  animation="border"
                                  size="sm"
                                  className="me-2"
                                />

                                Cargando proyectos...
                              </div>
                            ) : (
                              <Form.Select
                                value={proyectoId}
                                onChange={(event) =>
                                  setProyectoId(
                                    event.target.value
                                  )
                                }
                                required
                                disabled={
                                  proyectosActivos.length === 0
                                }
                              >
                                <option value="">
                                  Selecciona un proyecto
                                </option>

                                {proyectosActivos.map(
                                  (proyecto) => (
                                    <option
                                      key={proyecto.id}
                                      value={proyecto.id}
                                    >
                                      {proyecto.nombre}
                                    </option>
                                  )
                                )}
                              </Form.Select>
                            )}
                          </Form.Group>

                          {errorProyectos && (
                            <Alert
                              variant="warning"
                              className="mt-3 mb-0"
                            >
                              {errorProyectos}
                            </Alert>
                          )}

                          {!cargandoProyectos &&
                            proyectosActivos.length === 0 && (
                              <Alert
                                variant="info"
                                className="mt-3 mb-0"
                              >
                                No tienes proyectos activos.

                                <div className="mt-2">
                                  <Link to="/proyectos/nuevo">
                                    Crear un proyecto
                                  </Link>
                                </div>
                              </Alert>
                            )}

                          <Form.Text className="text-muted">
                            La actividad quedará vinculada
                            al proyecto seleccionado.
                          </Form.Text>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                )}

                {/* ========================= */}
                {/* TÍTULO */}
                {/* ========================= */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Título de la actividad
                  </Form.Label>

                  <Form.Control
                    name="titulo"
                    value={datos.titulo}
                    onChange={onChange}
                    placeholder="Ej. Implementar autenticación"
                    required
                    minLength={3}
                    maxLength={150}
                  />
                </Form.Group>

                {/* ========================= */}
                {/* DESCRIPCIÓN */}
                {/* ========================= */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Descripción
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descripcion"
                    value={datos.descripcion}
                    onChange={onChange}
                    placeholder="Describe la actividad..."
                  />
                </Form.Group>

                {/* ========================= */}
                {/* TIPO Y FRECUENCIA */}
                {/* ========================= */}
                {!esEdicion && (
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Tipo de actividad
                        </Form.Label>

                        <Form.Select
                          name="tipo"
                          value={datos.tipo}
                          onChange={onChange}
                        >
                          <option value="UNICA">
                            Única
                          </option>

                          <option value="RECURRENTE">
                            Recurrente
                          </option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {datos.tipo === "RECURRENTE" && (
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Frecuencia
                          </Form.Label>

                          <Form.Select
                            name="frecuencia"
                            value={datos.frecuencia}
                            onChange={onChange}
                            required
                          >
                            <option value="">
                              Selecciona una frecuencia
                            </option>

                            <option value="DIARIA">
                              Diaria
                            </option>

                            <option value="SEMANAL">
                              Semanal
                            </option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    )}
                  </Row>
                )}

                {/* ========================= */}
                {/* FECHA LÍMITE */}
                {/* ========================= */}
                <Form.Group className="mb-4">
                  <Form.Label>
                    Fecha límite
                  </Form.Label>

                  <Form.Control
                    type="date"
                    name="fechaLimite"
                    value={datos.fechaLimite}
                    onChange={onChange}
                  />
                </Form.Group>

                {/* ========================= */}
                {/* INFORMACIÓN DEL DESTINO */}
                {/* ========================= */}
                {!esEdicion && destino === "PROYECTO" && (
                  <Alert variant="info">
                    <strong>Actividad colaborativa</strong>

                    <p className="mb-0 mt-1">
                      Al crear esta actividad,
                      quedará registrada dentro
                      del proyecto seleccionado.
                      Después podrás asignarla a
                      un integrante desde la
                      pantalla del proyecto.
                    </p>
                  </Alert>
                )}

                {/* ========================= */}
                {/* BOTONES */}
                {/* ========================= */}
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    disabled={
                      guardando ||
                      (!esEdicion &&
                        destino === "PROYECTO" &&
                        (cargandoProyectos ||
                          !proyectoId))
                    }
                  >
                    {guardando
                      ? "Guardando..."
                      : esEdicion
                        ? "Guardar cambios"
                        : "Crear actividad"}
                  </Button>

                  <Button
                    as={Link}
                    to={rutaCancelar}
                    variant="outline-secondary"
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FormActividad;
