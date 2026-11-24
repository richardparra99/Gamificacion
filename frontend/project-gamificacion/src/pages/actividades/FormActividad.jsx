
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

  const esEdicion = Boolean(id);

  const [datos, setDatos] = useState(datosIniciales);

  const [destino, setDestino] = useState("PERSONAL");
  const [proyectoId, setProyectoId] = useState("");

  const [proyectos, setProyectos] = useState([]);

  const [cargando, setCargando] = useState(esEdicion);
  const [cargandoProyectos, setCargandoProyectos] =
    useState(!esEdicion);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [errorProyectos, setErrorProyectos] = useState("");

  // NUEVO: VALIDACIÓN VISUAL
  const [tocados, setTocados] = useState({});
  const [intentadoEnviar, setIntentadoEnviar] =
    useState(false);

  const proyectosActivos = proyectos.filter(
    (proyecto) => proyecto.estado === "ACTIVO"
  );

  const proyectoSeleccionado = proyectosActivos.find(
    (proyecto) =>
      String(proyecto.id) === String(proyectoId)
  );

  const errores = {
    titulo:
      datos.titulo.trim().length === 0
        ? "El título es obligatorio."
        : datos.titulo.trim().length < 3
          ? "El título debe tener al menos 3 caracteres."
          : datos.titulo.trim().length > 150
            ? "El título no puede superar 150 caracteres."
            : "",

    descripcion: "",

    tipo:
      !["UNICA", "RECURRENTE"].includes(datos.tipo)
        ? "Selecciona un tipo válido."
        : "",

    frecuencia:
      !esEdicion &&
      datos.tipo === "RECURRENTE" &&
      !["DIARIA", "SEMANAL"].includes(datos.frecuencia)
        ? "Selecciona la frecuencia de la actividad."
        : "",

    fechaLimite:
      datos.fechaLimite &&
      !/^\d{4}-\d{2}-\d{2}$/.test(datos.fechaLimite)
        ? "Selecciona una fecha válida."
        : "",

    proyectoId:
      !esEdicion &&
      destino === "PROYECTO" &&
      !proyectoSeleccionado
        ? "Debes seleccionar un proyecto activo."
        : "",
  };

  const mostrarValidacion = (campo) =>
    Boolean(tocados[campo] || intentadoEnviar);

  const esValido = (campo) =>
    mostrarValidacion(campo) && !errores[campo];

  const esInvalido = (campo) =>
    mostrarValidacion(campo) && Boolean(errores[campo]);

  const marcarTocado = (campo) => {
    setTocados((anterior) => ({
      ...anterior,
      [campo]: true,
    }));
  };

  // CARGAR PROYECTOS
  useEffect(() => {
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
        if (activo) setCargandoProyectos(false);
      });

    return () => {
      activo = false;
    };
  }, [esEdicion]);

  // CARGAR ACTIVIDAD PARA EDITAR
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
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [id, esEdicion]);

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

  const onCambiarDestino = (event) => {
    setDestino(event.target.value);
    setProyectoId("");
    setError("");
    setTocados((anterior) => ({
      ...anterior,
      proyectoId: false,
    }));
  };

  // GUARDAR ACTIVIDAD
  const onSubmit = async (event) => {
    event.preventDefault();

    if (guardando) return;

    setIntentadoEnviar(true);
    setError("");

    const camposValidar = [
      "titulo",
      "tipo",
      "frecuencia",
      "fechaLimite",
      "proyectoId",
    ];

    if (
      camposValidar.some((campo) => Boolean(errores[campo]))
    ) {
      return;
    }

    setGuardando(true);

    try {
      const payload = {
        titulo: datos.titulo.trim(),
        descripcion: datos.descripcion.trim() || null,
        fechaLimite: datos.fechaLimite || null,
      };

      if (esEdicion) {
        await actualizarActividad(id, payload);

        navigate("/actividades", {
          replace: true,
        });
        return;
      }

      const datosCreacion = {
        ...payload,
        tipo: datos.tipo,
        frecuencia:
          datos.tipo === "RECURRENTE"
            ? datos.frecuencia
            : null,
      };

      if (destino === "PERSONAL") {
        await crearActividad(datosCreacion);

        navigate("/actividades", {
          replace: true,
        });
        return;
      }

      if (destino === "PROYECTO") {
        await crearActividadProyecto(
          proyectoId,
          datosCreacion
        );

        navigate(
          `/proyectos/${proyectoId}/actividades`,
          { replace: true }
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo guardar la actividad"
      );
    } finally {
      setGuardando(false);
    }
  };

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

  const rutaCancelar =
    !esEdicion &&
    destino === "PROYECTO" &&
    proyectoId
      ? `/proyectos/${proyectoId}/actividades`
      : "/actividades";

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

              {error && (
                <Alert variant="danger">{error}</Alert>
              )}

              <Form noValidate onSubmit={onSubmit}>
                {/* DESTINO DE LA ACTIVIDAD */}
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
                              <>
                                <Form.Select
                                  value={proyectoId}
                                  onChange={(event) =>
                                    setProyectoId(
                                      event.target.value
                                    )
                                  }
                                  onBlur={() =>
                                    marcarTocado("proyectoId")
                                  }
                                  required
                                  disabled={
                                    proyectosActivos.length === 0
                                  }
                                  isValid={esValido("proyectoId")}
                                  isInvalid={esInvalido("proyectoId")}
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

                                <Form.Control.Feedback type="valid">
                                  Proyecto seleccionado.
                                </Form.Control.Feedback>

                                <Form.Control.Feedback type="invalid">
                                  {errores.proyectoId}
                                </Form.Control.Feedback>
                              </>
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

                {/* TÍTULO */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Título de la actividad
                  </Form.Label>

                  <Form.Control
                    name="titulo"
                    value={datos.titulo}
                    onChange={onChange}
                    onBlur={() => marcarTocado("titulo")}
                    placeholder="Ej. Implementar autenticación"
                    required
                    minLength={3}
                    maxLength={150}
                    isValid={esValido("titulo")}
                    isInvalid={esInvalido("titulo")}
                  />

                  <Form.Control.Feedback type="valid">
                    Título válido.
                  </Form.Control.Feedback>

                  <Form.Control.Feedback type="invalid">
                    {errores.titulo}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* DESCRIPCIÓN */}
                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descripcion"
                    value={datos.descripcion}
                    onChange={onChange}
                    onBlur={() => marcarTocado("descripcion")}
                    placeholder="Describe la actividad..."
                    isValid={
                      mostrarValidacion("descripcion") &&
                      datos.descripcion.trim().length > 0
                    }
                  />

                  <Form.Text className="text-muted">
                    Opcional.
                  </Form.Text>
                </Form.Group>

                {/* TIPO Y FRECUENCIA */}
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
                          onBlur={() => marcarTocado("tipo")}
                          isValid={esValido("tipo")}
                          isInvalid={esInvalido("tipo")}
                        >
                          <option value="UNICA">Única</option>
                          <option value="RECURRENTE">
                            Recurrente
                          </option>
                        </Form.Select>

                        <Form.Control.Feedback type="valid">
                          Tipo válido.
                        </Form.Control.Feedback>

                        <Form.Control.Feedback type="invalid">
                          {errores.tipo}
                        </Form.Control.Feedback>
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
                            onBlur={() =>
                              marcarTocado("frecuencia")
                            }
                            required
                            isValid={esValido("frecuencia")}
                            isInvalid={esInvalido("frecuencia")}
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

                          <Form.Control.Feedback type="valid">
                            Frecuencia válida.
                          </Form.Control.Feedback>

                          <Form.Control.Feedback type="invalid">
                            {errores.frecuencia}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    )}
                  </Row>
                )}

                {/* FECHA LÍMITE */}
                <Form.Group className="mb-4">
                  <Form.Label>
                    Fecha límite
                  </Form.Label>

                  <Form.Control
                    type="date"
                    name="fechaLimite"
                    value={datos.fechaLimite}
                    onChange={onChange}
                    onBlur={() => marcarTocado("fechaLimite")}
                    isValid={
                      mostrarValidacion("fechaLimite") &&
                      Boolean(datos.fechaLimite) &&
                      !errores.fechaLimite
                    }
                    isInvalid={esInvalido("fechaLimite")}
                  />

                  <Form.Control.Feedback type="valid">
                    Fecha válida.
                  </Form.Control.Feedback>

                  <Form.Control.Feedback type="invalid">
                    {errores.fechaLimite}
                  </Form.Control.Feedback>

                  <Form.Text className="text-muted">
                    Opcional.
                  </Form.Text>
                </Form.Group>

                {/* INFORMACIÓN DEL DESTINO */}
                {!esEdicion && destino === "PROYECTO" && (
                  <Alert variant="info">
                    <strong>Actividad colaborativa</strong>

                    <p className="mb-0 mt-1">
                      Al crear esta actividad, quedará
                      registrada dentro del proyecto
                      seleccionado. Después podrás
                      asignarla a un integrante desde la
                      pantalla del proyecto.
                    </p>
                  </Alert>
                )}

                {/* BOTONES */}
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    disabled={
                      guardando ||
                      (!esEdicion &&
                        destino === "PROYECTO" &&
                        cargandoProyectos)
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
