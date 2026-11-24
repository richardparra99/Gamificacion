
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Form,
  ProgressBar,
  Table,
} from "react-bootstrap";

import {
  BarChart3,
  RefreshCw,
  FolderKanban,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  obtenerResumenPersonal,
  obtenerHistorialPersonal,
} from "../../services/ReporteService";

import {
  obtenerProyectos,
} from "../../services/ProyectoService";

// Fechas UTC, igual que el backend
const fechaUTC = (fecha) =>
  fecha.toISOString().slice(0, 10);

const rangoInicial = () => {
  const hoy = new Date();
  const inicio = new Date(hoy);

  inicio.setUTCDate(inicio.getUTCDate() - 29);

  return {
    desde: fechaUTC(inicio),
    hasta: fechaUTC(hoy),
  };
};

const Reportes = () => {
  const [fechas, setFechas] = useState(rangoInicial);

  const [filtro, setFiltro] = useState(rangoInicial);

  const [resumen, setResumen] = useState(null);
  const [historial, setHistorial] = useState(null);
  const [proyectos, setProyectos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizacion, setActualizacion] = useState(0);

  useEffect(() => {
    let activo = true;

    Promise.all([
      obtenerResumenPersonal(),
      obtenerHistorialPersonal(
        filtro.desde,
        filtro.hasta
      ),
      obtenerProyectos(),
    ])
      .then(([rResumen, rHistorial, rProyectos]) => {
        if (!activo) return;

        setResumen(rResumen.resumen);
        setHistorial(rHistorial);
        setProyectos(rProyectos.proyectos || []);
        setError("");
      })
      .catch((err) => {
        if (activo) {
          setError(
            err.response?.data?.mensaje ||
              "No se pudieron obtener los reportes"
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [filtro, actualizacion]);

  const consultar = (event) => {
    event.preventDefault();

    if (fechas.desde > fechas.hasta) {
      setError(
        "La fecha inicial no puede ser mayor a la final"
      );
      return;
    }

    setCargando(true);
    setFiltro({ ...fechas });
  };

  const actualizar = () => {
    setCargando(true);
    setActualizacion((anterior) => anterior + 1);
  };

  const datosGrafico = historial?.porFecha || [];

  const tarjetas = [
    {
      titulo: "Total de actividades",
      valor: resumen?.totalActividades ?? 0,
    },
    {
      titulo: "Actividades únicas",
      valor: resumen?.actividadesUnicas ?? 0,
    },
    {
      titulo: "Únicas completadas",
      valor: resumen?.completadas ?? 0,
    },
    {
      titulo: "Recurrentes",
      valor: resumen?.actividadesRecurrentes ?? 0,
    },
  ];

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4 g-3">
        <Col>
          <h2 className="fw-bold">
            <BarChart3
              size={27}
              className="me-2"
            />
            Reportes personales
          </h2>

          <p className="text-muted mb-0">
            Consulta las estadísticas de tus
            actividades personales.
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
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={consultar}>
            <Row className="g-3 align-items-end">
              <Col md={5}>
                <Form.Label>Desde</Form.Label>
                <Form.Control
                  type="date"
                  value={fechas.desde}
                  required
                  onChange={(event) =>
                    setFechas((anterior) => ({
                      ...anterior,
                      desde: event.target.value,
                    }))
                  }
                />
              </Col>

              <Col md={5}>
                <Form.Label>Hasta</Form.Label>
                <Form.Control
                  type="date"
                  value={fechas.hasta}
                  required
                  onChange={(event) =>
                    setFechas((anterior) => ({
                      ...anterior,
                      hasta: event.target.value,
                    }))
                  }
                />
              </Col>

              <Col md={2}>
                <Button
                  type="submit"
                  className="w-100"
                  disabled={cargando}
                >
                  Consultar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">
            Generando reportes...
          </p>
        </div>
      ) : (
        <>
          <Row className="g-3 mb-4">
            {tarjetas.map((tarjeta) => (
              <Col
                md={6}
                lg={3}
                key={tarjeta.titulo}
              >
                <Card className="border-0 shadow-sm h-100">
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

          {/* PORCENTAJE DE PROGRESO */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5>Progreso de actividades únicas</h5>

              <h3 className="fw-bold mt-3">
                {resumen?.porcentajeProgreso ?? 0}%
              </h3>

              <ProgressBar
                now={resumen?.porcentajeProgreso ?? 0}
                max={100}
                variant="success"
                className="my-3"
              />

              <p className="text-muted mb-0">
                Completadas: {resumen?.completadas ?? 0}
                {" | "}
                Pendientes: {resumen?.pendientes ?? 0}
              </p>
            </Card.Body>
          </Card>

          {/* GRÁFICO DE CUMPLIMIENTOS */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-2">
                Cumplimientos por fecha
              </h5>

              <p className="text-muted small">
                Período: {historial?.periodo?.desde}
                {" a "}
                {historial?.periodo?.hasta}
              </p>

              <h4 className="mb-4">
                {historial?.totalCumplimientos ?? 0}
                {" "}
                <small className="text-muted">
                  cumplimientos
                </small>
              </h4>

              {datosGrafico.length === 0 ? (
                <p className="text-muted">
                  No hay cumplimientos en este período.
                </p>
              ) : (
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart data={datosGrafico}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        dataKey="fecha"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        allowDecimals={false}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="cantidad"
                        name="Cumplimientos"
                        fill="#0d6efd"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {datosGrafico.length > 0 && (
                <Table
                  responsive
                  size="sm"
                  className="mt-4"
                >
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Cumplimientos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosGrafico.map((dia) => (
                      <tr key={dia.fecha}>
                        <td>{dia.fecha}</td>
                        <td>{dia.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          {/* REPORTES DE PROYECTOS */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">
                <FolderKanban
                  size={21}
                  className="me-2"
                />
                Reportes de proyectos
              </h5>

              {proyectos.length === 0 ? (
                <p className="text-muted">
                  No tienes proyectos registrados.
                </p>
              ) : (
                <Row className="g-3">
                  {proyectos.map((proyecto) => (
                    <Col
                      md={6}
                      lg={4}
                      key={proyecto.id}
                    >
                      <Card className="h-100">
                        <Card.Body>
                          <h6 className="fw-bold">
                            {proyecto.nombre}
                          </h6>

                          <p className="text-muted small">
                            Estado: {proyecto.estado}
                          </p>

                          <Button
                            as={Link}
                            to={`/reportes/proyectos/${proyecto.id}`}
                            size="sm"
                            variant="outline-primary"
                          >
                            Ver reporte
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default Reportes;
