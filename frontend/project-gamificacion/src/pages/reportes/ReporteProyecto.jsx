
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Form,
  Badge,
  ProgressBar,
  Table,
} from "react-bootstrap";

import {
  ArrowLeft,
  Users,
  RefreshCw,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import {
  obtenerReporteProyecto,
  obtenerReporteMiembros,
} from "../../services/ReporteService";

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

const ReporteProyecto = () => {
  const { id } = useParams();

  const [fechas, setFechas] = useState(rangoInicial);
  const [filtro, setFiltro] = useState(rangoInicial);

  const [reporte, setReporte] = useState(null);
  const [miembros, setMiembros] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizacion, setActualizacion] = useState(0);

  useEffect(() => {
    let activo = true;

    Promise.all([
      obtenerReporteProyecto(
        id,
        filtro.desde,
        filtro.hasta
      ),
      obtenerReporteMiembros(
        id,
        filtro.desde,
        filtro.hasta
      ),
    ])
      .then(([rProyecto, rMiembros]) => {
        if (!activo) return;

        setReporte(rProyecto);
        setMiembros(rMiembros.miembros || []);
        setError("");
      })
      .catch((err) => {
        if (activo) {
          setError(
            err.response?.data?.mensaje ||
              "No se pudo generar el reporte del proyecto"
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [id, filtro, actualizacion]);

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

  const resumen = reporte?.resumen;
  const datosFecha =
    reporte?.cumplimientosPorFecha || [];

  const datosMiembros = miembros.map((miembro) => ({
    nombre: miembro.nombreCompleto,
    asignadas: miembro.totalActividades,
    completadas: miembro.completadas,
    cumplimientos: miembro.totalCumplimientos,
  }));

  return (
    <Container className="py-4">
      <Link
        to="/reportes"
        className="text-decoration-none d-inline-flex align-items-center gap-2 mb-3"
      >
        <ArrowLeft size={18} />
        Volver a reportes
      </Link>

      <Row className="align-items-center mb-4 g-3">
        <Col>
          <h2 className="fw-bold">
            Reporte de proyecto
          </h2>

          <p className="text-muted mb-0">
            {reporte?.proyecto?.nombre ||
              `Proyecto #${id}`}
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

      {/* FILTRO DE FECHAS */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={consultar}>
            <Row className="g-3 align-items-end">
              <Col md={5}>
                <Form.Label>Desde</Form.Label>

                <Form.Control
                  type="date"
                  required
                  value={fechas.desde}
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
                  required
                  value={fechas.hasta}
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
            Generando reporte del proyecto...
          </p>
        </div>
      ) : !reporte ? (
        <Alert variant="warning">
          No hay información disponible.
        </Alert>
      ) : (
        <>
          {/* TARJETAS DE ESTADÍSTICAS */}
          <Row className="g-3 mb-4">
            {[
              {
                titulo: "Actividades totales",
                valor: resumen?.totalActividades ?? 0,
              },
              {
                titulo: "Únicas completadas",
                valor: resumen?.completadas ?? 0,
              },
              {
                titulo: "Únicas pendientes",
                valor: resumen?.pendientes ?? 0,
              },
              {
                titulo: "Cumplimientos del período",
                valor:
                  reporte.totalCumplimientosPeriodo ?? 0,
              },
            ].map((tarjeta) => (
              <Col md={6} lg={3} key={tarjeta.titulo}>
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

          {/* PROGRESO */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5>
                Progreso de actividades únicas
              </h5>

              <h3 className="mt-3">
                {resumen?.porcentajeProgreso ?? 0}%
              </h3>

              <ProgressBar
                now={resumen?.porcentajeProgreso ?? 0}
                max={100}
                variant="success"
                className="my-3"
              />

              <p className="text-muted mb-0">
                Actividades recurrentes:{" "}
                {resumen?.actividadesRecurrentes ?? 0}
              </p>
            </Card.Body>
          </Card>

          {/* GRÁFICO POR FECHA */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-2">
                Cumplimientos del proyecto por fecha
              </h5>

              <p className="text-muted small">
                Del {reporte.periodo?.desde}
                {" al "}
                {reporte.periodo?.hasta}
              </p>

              {datosFecha.length === 0 ? (
                <p className="text-muted">
                  No hay cumplimientos en este período.
                </p>
              ) : (
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datosFecha}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="fecha"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="cantidad"
                        name="Cumplimientos"
                        fill="#198754"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* ESTADÍSTICAS POR INTEGRANTE */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-3">
                <Users size={20} className="me-2" />
                Estadísticas por integrante
              </h5>

              {miembros.length === 0 ? (
                <p className="text-muted">
                  No hay integrantes registrados.
                </p>
              ) : (
                <>
                  <div
                    style={{
                      width: "100%",
                      height: Math.max(
                        300,
                        datosMiembros.length * 55
                      ),
                    }}
                    className="mb-4"
                  >
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <BarChart
                        data={datosMiembros}
                        layout="vertical"
                        margin={{
                          top: 10,
                          right: 20,
                          left: 50,
                          bottom: 10,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                        />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="nombre"
                          width={115}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip />
                        <Legend />

                        <Bar
                          dataKey="asignadas"
                          name="Actividades asignadas"
                          fill="#0d6efd"
                        />

                        <Bar
                          dataKey="completadas"
                          name="Únicas completadas"
                          fill="#198754"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <Table
                    responsive
                    hover
                    className="align-middle"
                  >
                    <thead>
                      <tr>
                        <th>Integrante</th>
                        <th>Rol</th>
                        <th>Asignadas</th>
                        <th>Únicas completadas</th>
                        <th>Cumplimientos del período</th>
                        <th>Progreso</th>
                      </tr>
                    </thead>

                    <tbody>
                      {miembros.map((miembro) => (
                        <tr key={miembro.usuarioId}>
                          <td>
                            {miembro.nombreCompleto}
                          </td>
                          <td>
                            <Badge bg={
                              miembro.rol === "ADMIN"
                                ? "primary"
                                : "secondary"
                            }>
                              {miembro.rol}
                            </Badge>
                          </td>
                          <td>
                            {miembro.totalActividades}
                          </td>
                          <td>
                            {miembro.completadas}
                          </td>
                          <td>
                            {miembro.totalCumplimientos}
                          </td>
                          <td>
                            {miembro.porcentajeProgreso}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default ReporteProyecto;
