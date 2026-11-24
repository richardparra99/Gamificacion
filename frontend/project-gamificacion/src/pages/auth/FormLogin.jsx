import { useState } from "react";
import { Link } from "react-router-dom";
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
import { ShieldCheck, LogIn } from "lucide-react";
import useAuthentication from "../../hooks/useAuthentication";

const AZUL_OSCURO = "#142D4E";
const AZUL_ACENTO = "#285278";

const FormLogin = () => {
  const { doLogin } = useAuthentication();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (cargando) return;

    setError("");
    setCargando(true);

    try {
      await doLogin({ email: email.trim(), password });
    } catch (err) {
      setError(
        err.response?.data?.mensaje || "No se pudo iniciar sesión"
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center py-5"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #EAF1F9 0%, #F5F8FD 55%, #DFEAF5 100%)",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col sm={10} md={7} lg={5} xl={4}>
            <Card
              className="border-0 overflow-hidden"
              style={{
                borderRadius: "18px",
                boxShadow: "0 16px 45px rgba(20, 45, 78, 0.13)",
              }}
            >
              <div
                className="text-center text-white px-4 py-4"
                style={{
                  background: `linear-gradient(135deg, ${AZUL_OSCURO}, ${AZUL_ACENTO})`,
                }}
              >
                <div
                  className="d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "15px",
                    backgroundColor: "rgba(255,255,255,0.14)",
                  }}
                >
                  <ShieldCheck size={29} />
                </div>
                <h2 className="fw-bold mb-1">MiniJira</h2>
                <p className="mb-0" style={{ color: "#D9E5F2" }}>
                  Organiza tus tareas y gana experiencia
                </p>
              </div>

              <Card.Body className="p-4 p-md-5">
                <h4 className="fw-bold mb-1" style={{ color: AZUL_OSCURO }}>
                  Iniciar sesión
                </h4>
                <p className="text-muted mb-4">
                  Ingresa tus datos para continuar.
                </p>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={onSubmit}>
                  <Form.Group className="mb-3" controlId="login-email">
                    <Form.Label className="fw-semibold">
                      Correo electrónico
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                      style={{ borderRadius: 9, padding: "11px 13px" }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="login-password">
                    <Form.Label className="fw-semibold">Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                      style={{ borderRadius: 9, padding: "11px 13px" }}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100 d-flex align-items-center justify-content-center gap-2 border-0"
                    disabled={cargando}
                    style={{
                      backgroundColor: AZUL_OSCURO,
                      borderRadius: 9,
                      padding: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {cargando ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        Ingresando...
                      </>
                    ) : (
                      <>
                        <LogIn size={18} />
                        Iniciar sesión
                      </>
                    )}
                  </Button>
                </Form>

                <p className="text-center mt-4 mb-0 small">
                  ¿No tienes cuenta?{" "}
                  <Link
                    to="/register"
                    className="fw-semibold text-decoration-none"
                    style={{ color: AZUL_ACENTO }}
                  >
                    Regístrate
                  </Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FormLogin;
