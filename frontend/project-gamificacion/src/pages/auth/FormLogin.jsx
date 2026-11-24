
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

  // VALIDACIÓN VISUAL ORIGINAL
  const [tocados, setTocados] = useState({});
  const [intentadoEnviar, setIntentadoEnviar] =
    useState(false);

  const errores = {
    email:
      email.trim() === ""
        ? "El correo electrónico es obligatorio."
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email.trim()
          )
          ? "Ingresa un correo electrónico válido."
          : "",

    password:
      password.length === 0
        ? "La contraseña es obligatoria."
        : "",
  };

  const mostrarValidacion = (campo) =>
    Boolean(tocados[campo] || intentadoEnviar);

  const marcarTocado = (campo) => {
    setTocados((anterior) => ({
      ...anterior,
      [campo]: true,
    }));
  };

  const esValido = (campo) =>
    mostrarValidacion(campo) && !errores[campo];

  const esInvalido = (campo) =>
    mostrarValidacion(campo) && Boolean(errores[campo]);

  // INICIAR SESIÓN
  const onSubmit = async (event) => {
    event.preventDefault();

    if (cargando) return;

    setIntentadoEnviar(true);
    setError("");

    if (Object.values(errores).some(Boolean)) {
      return;
    }

    setCargando(true);

    try {
      await doLogin({
        email: email.trim(),
        password,
      });
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo iniciar sesión"
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center py-2"
      style={{
        minHeight: "100dvh",
        boxSizing: "border-box",
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
                borderRadius: "16px",
                boxShadow:
                  "0 12px 35px rgba(20, 45, 78, 0.13)",
              }}
            >
              {/* ENCABEZADO AZUL COMPACTO */}
              <div
                className="text-center text-white px-3 py-3"
                style={{
                  background: `linear-gradient(135deg, ${AZUL_OSCURO}, ${AZUL_ACENTO})`,
                }}
              >
                <div
                  className="d-inline-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: 43,
                    height: 43,
                    borderRadius: "12px",
                    backgroundColor:
                      "rgba(255,255,255,0.14)",
                  }}
                >
                  <ShieldCheck size={24} />
                </div>

                <h2
                  className="fw-bold mb-1"
                  style={{ fontSize: "1.55rem" }}
                >
                  MiniJira
                </h2>

                <p
                  className="mb-0"
                  style={{
                    color: "#D9E5F2",
                    fontSize: "0.85rem",
                  }}
                >
                  Organiza tus tareas y gana experiencia
                </p>
              </div>

              {/* CONTENIDO DEL LOGIN */}
              <Card.Body className="p-3 p-md-4">
                <h4
                  className="fw-bold mb-1"
                  style={{
                    color: AZUL_OSCURO,
                    fontSize: "1.3rem",
                  }}
                >
                  Iniciar sesión
                </h4>

                <p
                  className="text-muted mb-3"
                  style={{ fontSize: "0.85rem" }}
                >
                  Ingresa tus datos para continuar.
                </p>

                {error && (
                  <Alert
                    variant="danger"
                    className="py-2 mb-3"
                  >
                    {error}
                  </Alert>
                )}

                <Form noValidate onSubmit={onSubmit}>
                  {/* CORREO ELECTRÓNICO */}
                  <Form.Group
                    className="mb-3"
                    controlId="login-email"
                  >
                    <Form.Label
                      className="fw-semibold mb-1"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Correo electrónico
                    </Form.Label>

                    <Form.Control
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      onBlur={() =>
                        marcarTocado("email")
                      }
                      autoComplete="email"
                      required
                      isValid={esValido("email")}
                      isInvalid={esInvalido("email")}
                      style={{
                        borderRadius: 9,
                        padding: "9px 12px",
                        fontSize: "0.9rem",
                      }}
                    />

                    <Form.Control.Feedback type="valid">
                      Correo válido.
                    </Form.Control.Feedback>

                    <Form.Control.Feedback type="invalid">
                      {errores.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* CONTRASEÑA */}
                  <Form.Group
                    className="mb-3"
                    controlId="login-password"
                  >
                    <Form.Label
                      className="fw-semibold mb-1"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Contraseña
                    </Form.Label>

                    <Form.Control
                      type="password"
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      onBlur={() =>
                        marcarTocado("password")
                      }
                      autoComplete="current-password"
                      required
                      isValid={esValido("password")}
                      isInvalid={esInvalido("password")}
                      style={{
                        borderRadius: 9,
                        padding: "9px 12px",
                        fontSize: "0.9rem",
                      }}
                    />

                    <Form.Control.Feedback type="valid">
                      Campo completado.
                    </Form.Control.Feedback>

                    <Form.Control.Feedback type="invalid">
                      {errores.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* BOTÓN INICIAR SESIÓN */}
                  <Button
                    type="submit"
                    className="w-100 d-flex align-items-center justify-content-center gap-2 border-0"
                    disabled={cargando}
                    style={{
                      backgroundColor: AZUL_OSCURO,
                      borderRadius: 9,
                      padding: "10px",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    {cargando ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                        />
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

                {/* REGISTRARSE */}
                <p
                  className="text-center mt-3 mb-0 small"
                >
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
