import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  Container,
  Row,
  Col,
  Card,
  ProgressBar,
  Alert,
  Spinner,
} from "react-bootstrap";

import api from "../../api/axios";

const Dashboard = () => {
  const { usuario } = useSelector(
    (state) => state.auth
  );

  const [perfil, setPerfil] = useState(null);
  const [resumen, setResumen] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const cargarDatos = async () => {
      try {
        const [respuestaPerfil, respuestaResumen] =
          await Promise.all([
            api.get("/gamificacion/me", {
              signal: controller.signal,
            }),
            api.get("/reportes/resumen", {
              signal: controller.signal,
            }),
          ]);

        setPerfil(respuestaPerfil.data.perfil);
        setResumen(respuestaResumen.data.resumen);
      } catch (error) {
        if (
          error.code !== "ERR_CANCELED" &&
          !controller.signal.aborted
        ) {
          setError(
            error.response?.data?.mensaje ||
              "No se pudo cargar el dashboard"
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };

    cargarDatos();

    return () => controller.abort();
  }, []);

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">
          Cargando estadísticas...
        </p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const tarjetas = [
    {
      titulo: "Experiencia total",
      valor: `${perfil?.experiencia ?? 0} XP`,
    },
    {
      titulo: "Nivel",
      valor: perfil?.nivel ?? 1,
    },
    {
      titulo: "Actividades personales",
      valor: resumen?.totalActividades ?? 0,
    },
    {
      titulo: "Actividades únicas completadas",
      valor: resumen?.completadas ?? 0,
    },
  ];

  return (
    <Container className="py-4">
      <h2 className="fw-bold">
        ¡Bienvenido, {usuario?.nombreCompleto}!
      </h2>

      <p className="text-muted">
        Consulta tu progreso y sigue ganando
        experiencia.
      </p>

      <Row className="g-3 mt-2">
        {tarjetas.map((tarjeta) => (
          <Col md={6} lg={3} key={tarjeta.titulo}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <p className="text-muted mb-2">
                  {tarjeta.titulo}
                </p>

                <h3 className="fw-bold">
                  {tarjeta.valor}
                </h3>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3 mt-3">
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h5>Progreso del nivel</h5>

              <ProgressBar
                now={perfil?.xpActualNivel ?? 0}
                max={perfil?.xpSiguienteNivel ?? 100}
                className="my-3"
              />

              <p className="text-muted mb-0">
                Te faltan{" "}
                {perfil?.xpRestante ?? 100} XP para
                el siguiente nivel.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h5>Logros desbloqueados</h5>

              {perfil?.logros?.length ? (
                perfil.logros.map((logro) => (
                  <p key={logro.codigo} className="mb-2">
                    🏆 {logro.nombre}
                  </p>
                ))
              ) : (
                <p className="text-muted">
                  Completa actividades para
                  desbloquear tu primer logro.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
