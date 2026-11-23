
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Table,
  Alert,
  Spinner,
  ProgressBar,
} from "react-bootstrap";

import {
  Trophy,
  Zap,
  Medal,
  Target,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

import {
  obtenerPerfilGamificacion,
  obtenerHistorialPuntos,
} from "../../services/GamificacionService";

const LOGROS_DISPONIBLES = [
  {
    codigo: "PRIMER_PASO",
    nombre: "Primer paso",
    descripcion: "Completa tu primera actividad.",
    requisito: 1,
  },
  {
    codigo: "CONSTANCIA",
    nombre: "Constancia",
    descripcion: "Registra 5 cumplimientos.",
    requisito: 5,
  },
  {
    codigo: "IMPARABLE",
    nombre: "Imparable",
    descripcion: "Registra 10 cumplimientos.",
    requisito: 10,
  },
];

const PerfilGamificacion = () => {
  const usuario = useSelector(
    (state) => state.auth.usuario
  );

  const [perfil, setPerfil] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizacion, setActualizacion] = useState(0);

  // CARGAR INFORMACIÓN DESDE EL BACKEND
  useEffect(() => {
    let activo = true;

    Promise.all([
      obtenerPerfilGamificacion(),
      obtenerHistorialPuntos(),
    ])
      .then(([respuestaPerfil, respuestaHistorial]) => {
        if (!activo) return;

        setPerfil(respuestaPerfil.perfil);
        setMovimientos(
          respuestaHistorial.movimientos || []
        );
        setError("");
      })
      .catch((err) => {
        if (activo) {
          setError(
            err.response?.data?.mensaje ||
              "No se pudo cargar la gamificación"
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

  // Verificar logros desbloqueados
  const tieneLogro = (codigo) => {
    return (perfil?.logros || []).some(
      (logro) => logro.codigo === codigo
    );
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-BO", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">
          Cargando perfil de gamificación...
        </p>
      </Container>
    );
  }

  if (error && !perfil) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={actualizar}>
          Reintentar
        </Button>
      </Container>
    );
  }

  const experiencia = perfil?.experiencia ?? 0;
  const nivel = perfil?.nivel ?? 1;
  const xpActual = perfil?.xpActualNivel ?? 0;
  const xpSiguiente = perfil?.xpSiguienteNivel ?? 100;
  const xpRestante = perfil?.xpRestante ?? 100;

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="fw-bold">
            Mi gamificación
          </h2>
          <p className="text-muted">
            Consulta tu experiencia, niveles y logros.
          </p>
        </Col>

        <Col xs="auto">
          <Button
            variant="outline-primary"
            onClick={actualizar}
            disabled={cargando}
          >
            <RefreshCw size={17} className="me-2" />
            Actualizar
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {/* PERFIL DEL USUARIO */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Row className="align-items-center g-3">
            <Col md="auto">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                style={{
                  width: 80,
                  height: 80,
                }}
              >
                <Trophy size={38} />
              </div>
            </Col>

            <Col>
              <h4 className="fw-bold mb-1">
                {usuario?.nombreCompleto ||
                  "Mi perfil"}
              </h4>

              <p className="text-muted mb-2">
                Nivel {nivel}
              </p>

              <Badge bg="primary">
                {experiencia} XP acumulados
              </Badge>
            </Col>
          </Row>

          <hr className="my-4" />

          <div className="d-flex justify-content-between mb-2">
            <strong>Progreso de nivel</strong>
            <span>
              {xpActual} / {xpSiguiente} XP
            </span>
          </div>

          <ProgressBar
            now={xpActual}
            max={xpSiguiente}
            variant="success"
          />

          <p className="text-muted mt-2 mb-0">
            Te faltan {xpRestante} XP para alcanzar
            el nivel {nivel + 1}.
          </p>
        </Card.Body>
      </Card>

      {/* RESUMEN */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <Zap className="text-warning mb-2" />
              <p className="text-muted mb-1">
                Experiencia total
              </p>
              <h3>{experiencia} XP</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <Target className="text-primary mb-2" />
              <p className="text-muted mb-1">
                Nivel actual
              </p>
              <h3>{nivel}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <Medal className="text-success mb-2" />
              <p className="text-muted mb-1">
                Logros desbloqueados
              </p>
              <h3>{perfil?.logros?.length ?? 0}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* LOGROS */}
      <h4 className="fw-bold mb-3">
        Mis logros
      </h4>

      <Row className="g-3 mb-4">
        {LOGROS_DISPONIBLES.map((logro) => {
          const desbloqueado = tieneLogro(
            logro.codigo
          );

          return (
            <Col md={4} key={logro.codigo}>
              <Card
                className={`h-100 shadow-sm ${
                  desbloqueado
                    ? "border-success"
                    : "border-0"
                }`}
              >
                <Card.Body className="text-center">
                  <Medal
                    size={42}
                    className={
                      desbloqueado
                        ? "text-warning"
                        : "text-secondary"
                    }
                  />

                  <h5 className="mt-3">
                    {logro.nombre}
                  </h5>

                  <p className="text-muted small">
                    {logro.descripcion}
                  </p>

                  <Badge
                    bg={
                      desbloqueado
                        ? "success"
                        : "secondary"
                    }
                  >
                    {desbloqueado
                      ? "Desbloqueado"
                      : "Bloqueado"}
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* HISTORIAL DE PUNTOS */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h4 className="fw-bold mb-3">
            <CalendarDays
              size={22}
              className="me-2"
            />
            Historial de experiencia
          </h4>

          {movimientos.length === 0 ? (
            <p className="text-muted">
              Todavía no has ganado puntos.
              Completa actividades para comenzar.
            </p>
          ) : (
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Motivo</th>
                  <th>Puntos</th>
                  <th>Fecha</th>
                </tr>
              </thead>

              <tbody>
                {movimientos.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td>{movimiento.motivo}</td>
                    <td>
                      <Badge bg="success">
                        +{movimiento.puntos} XP
                      </Badge>
                    </td>
                    <td>
                      {formatearFecha(
                        movimiento.createdAt
                      )}
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

export default PerfilGamificacion;
