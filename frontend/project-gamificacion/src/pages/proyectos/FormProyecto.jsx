
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

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
  obtenerProyecto,
  crearProyecto,
  actualizarProyecto,
} from "../../services/ProyectoService";

const FormProyecto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const usuario = useSelector((state) => state.auth.usuario);

  const esEdicion = Boolean(id);

  const [datos, setDatos] = useState({
    nombre: "",
    descripcion: "",
    estado: "ACTIVO",
  });

  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [autorizado, setAutorizado] = useState(!esEdicion);

  useEffect(() => {
    if (!esEdicion) return;

    let activo = true;

    obtenerProyecto(id)
      .then((respuesta) => {
        if (!activo) return;

        const proyecto = respuesta.proyecto;

        if (
          Number(proyecto.propietarioId) !==
          Number(usuario?.id)
        ) {
          setAutorizado(false);
          setError("Solo el propietario puede editar este proyecto");
          return;
        }

        setAutorizado(true);

        setDatos({
          nombre: proyecto.nombre || "",
          descripcion: proyecto.descripcion || "",
          estado: proyecto.estado || "ACTIVO",
        });
      })
      .catch((err) => {
        if (activo) {
          setAutorizado(false);
          setError(
            err.response?.data?.mensaje ||
              "No se pudo cargar el proyecto"
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [id, esEdicion, usuario?.id]);

  const onChange = (event) => {
    const { name, value } = event.target;

    setDatos((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!autorizado || guardando) return;

    setError("");
    setGuardando(true);

    try {
      const payload = {
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion.trim() || null,
      };

      let proyectoId;

      if (esEdicion) {
        await actualizarProyecto(id, {
          ...payload,
          estado: datos.estado,
        });

        proyectoId = id;
      } else {
        const respuesta = await crearProyecto(payload);
        proyectoId = respuesta.proyecto.id;
      }

      navigate(`/proyectos/${proyectoId}`, {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo guardar el proyecto"
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando proyecto...</p>
      </Container>
    );
  }

  if (!autorizado) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error || "No tienes acceso a este formulario"}
        </Alert>

        <Button as={Link} to="/proyectos">
          Volver a proyectos
        </Button>
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
                  ? "Editar proyecto"
                  : "Crear proyecto"}
              </h2>

              <p className="text-muted">
                {esEdicion
                  ? "Actualiza los datos de tu proyecto."
                  : "Organiza un equipo y administra sus actividades."}
              </p>

              {error && (
                <Alert variant="danger">{error}</Alert>
              )}

              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Nombre del proyecto
                  </Form.Label>

                  <Form.Control
                    name="nombre"
                    value={datos.nombre}
                    onChange={onChange}
                    minLength={3}
                    maxLength={150}
                    required
                    placeholder="Ej. Sistema de Gamificación"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="descripcion"
                    value={datos.descripcion}
                    onChange={onChange}
                    placeholder="Describe el objetivo del proyecto"
                  />
                </Form.Group>

                {esEdicion && (
                  <Form.Group className="mb-4">
                    <Form.Label>Estado</Form.Label>

                    <Form.Select
                      name="estado"
                      value={datos.estado}
                      onChange={onChange}
                    >
                      <option value="ACTIVO">Activo</option>
                      <option value="FINALIZADO">
                        Finalizado
                      </option>
                    </Form.Select>
                  </Form.Group>
                )}

                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    disabled={guardando}
                  >
                    {guardando
                      ? "Guardando..."
                      : esEdicion
                        ? "Guardar cambios"
                        : "Crear proyecto"}
                  </Button>

                  <Button
                    as={Link}
                    to={esEdicion
                      ? `/proyectos/${id}`
                      : "/proyectos"}
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

export default FormProyecto;
