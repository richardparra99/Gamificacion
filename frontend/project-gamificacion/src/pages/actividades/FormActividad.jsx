
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

  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!esEdicion) return;

    let activo = true;

    const cargarActividad = async () => {
      try {
        const respuesta = await obtenerActividad(id);
        const actividad = respuesta.actividad;

        if (activo) {
          setDatos({
            titulo: actividad.titulo || "",
            descripcion: actividad.descripcion || "",
            tipo: actividad.tipo,
            frecuencia: actividad.frecuencia || "",
            fechaLimite: actividad.fechaLimite || "",
          });
        }
      } catch (err) {
        if (activo) {
          setError(
            err.response?.data?.mensaje ||
              "No se pudo cargar la actividad"
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarActividad();

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

  const onSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setGuardando(true);

    try {
      let payload;

      if (esEdicion) {
        payload = {
          titulo: datos.titulo.trim(),
          descripcion: datos.descripcion.trim() || null,
          fechaLimite: datos.fechaLimite || null,
        };

        await actualizarActividad(id, payload);
      } else {
        payload = {
          titulo: datos.titulo.trim(),
          descripcion: datos.descripcion.trim() || null,
          tipo: datos.tipo,
          frecuencia:
            datos.tipo === "RECURRENTE"
              ? datos.frecuencia
              : null,
          fechaLimite: datos.fechaLimite || null,
        };

        if (
          payload.tipo === "RECURRENTE" &&
          !payload.frecuencia
        ) {
          setError(
            "Debes seleccionar la frecuencia de la actividad."
          );

          return;
        }

        await crearActividad(payload);
      }

      navigate("/actividades", { replace: true });
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

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando actividad...</p>
      </Container>
    );
  }

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
                  ? "Modifica los datos de tu actividad."
                  : "Registra una actividad y comienza a ganar XP."}
              </p>

              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Título de la actividad
                  </Form.Label>

                  <Form.Control
                    name="titulo"
                    value={datos.titulo}
                    onChange={onChange}
                    placeholder="Ej. Estudiar programación"
                    required
                    minLength={3}
                    maxLength={150}
                  />
                </Form.Group>

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

                {!esEdicion && (
                  <>
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
                  </>
                )}

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

                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    disabled={guardando}
                  >
                    {guardando
                      ? "Guardando..."
                      : esEdicion
                        ? "Guardar cambios"
                        : "Crear actividad"}
                  </Button>

                  <Button
                    as={Link}
                    to="/actividades"
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
