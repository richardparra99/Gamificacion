
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

import { UserPlus, ShieldCheck } from "lucide-react";
import useAuthentication from "../../hooks/useAuthentication";

const AZUL_OSCURO = "#142D4E";
const AZUL_ACENTO = "#285278";

const FormRegister = () => {
  const { doRegister } = useAuthentication();

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // VALIDACIONES ORIGINALES
  const [tocados, setTocados] = useState({});
  const [intentadoEnviar, setIntentadoEnviar] =
    useState(false);

  const errores = {
    nombreCompleto:
      nombreCompleto.trim().length === 0
        ? "El nombre completo es obligatorio."
        : nombreCompleto.trim().length < 3
          ? "Ingresa al menos 3 caracteres."
          : "",

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
        : password.length < 8
          ? "La contraseña debe tener al menos 8 caracteres."
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

  const esInvalido = (campo) =>
    mostrarValidacion(campo) && Boolean(errores[campo]);

  const esValido = (campo) =>
    mostrarValidacion(campo) && !errores[campo];

  // REGISTRAR USUARIO
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
      await doRegister({
        nombreCompleto: nombreCompleto.trim(),
        email: email.trim(),
        password,
      });
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo registrar el usuario"
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
                  Crear cuenta
                </h2>

                <p
                  className="mb-0"
                  style={{
                    color: "#D9E5F2",
                    fontSize: "0.85rem",
                  }}
                >
                  Únete a MiniJira y comienza a colaborar
                </p>
              </div>

              {/* FORMULARIO DE REGISTRO */}
              <Card.Body className="p-3 p-md-4">
                <h4
                  className="fw-bold mb-1"
                  style={{
                    color: AZUL_OSCURO,
                    fontSize: "1.3rem",
                  }}
                >
                  Regístrate
                </h4>

                <p className="text-muted mb-2"></p>

                {error && (
                  <Alert
                    variant="danger"
                    className="py-2 mb-3"
                  >
                    {error}
                  </Alert>
                )}

                <Form noValidate onSubmit={onSubmit}>
                  {/* NOMBRE COMPLETO */}
                  <Form.Group
                    className="mb-3"
                    controlId="register-name"
                  >
                    <Form.Label
                      className="fw-semibold mb-1"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Nombre completo
                    </Form.Label>

                    <Form.Control
                      type="text"
                      placeholder="Tu nombre y apellido"
                      value={nombreCompleto}
                      onChange={(event) =>
                        setNombreCompleto(
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        marcarTocado("nombreCompleto")
                      }
                      autoComplete="name"
                      required
                      minLength={3}
                      isValid={esValido("nombreCompleto")}
                      isInvalid={esInvalido("nombreCompleto")}
                      style={{
                        borderRadius: 9,
                        padding: "9px 12px",
                        fontSize: "0.9rem",
                      }}
                    />

                    <Form.Control.Feedback type="valid">
                      Nombre válido.
                    </Form.Control.Feedback>

                    <Form.Control.Feedback type="invalid">
                      {errores.nombreCompleto}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* CORREO ELECTRÓNICO */}
                  <Form.Group
                    className="mb-3"
                    controlId="register-email"
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
                    controlId="register-password"
                  >
                    <Form.Label
                      className="fw-semibold mb-1"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Contraseña
                    </Form.Label>

                    <Form.Control
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      onBlur={() =>
                        marcarTocado("password")
                      }
                      autoComplete="new-password"
                      required
                      minLength={8}
                      isValid={esValido("password")}
                      isInvalid={esInvalido("password")}
                      style={{
                        borderRadius: 9,
                        padding: "9px 12px",
                        fontSize: "0.9rem",
                      }}
                    />

                    <Form.Control.Feedback type="valid">
                      Contraseña válida.
                    </Form.Control.Feedback>

                    <Form.Control.Feedback type="invalid">
                      {errores.password}
                    </Form.Control.Feedback>

                    {!mostrarValidacion("password") && (
                      <Form.Text className="text-muted">
                        Usa al menos 8 caracteres.
                      </Form.Text>
                    )}
                  </Form.Group>

                  {/* BOTÓN CREAR CUENTA */}
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
                        Registrando...
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Crear cuenta
                      </>
                    )}
                  </Button>
                </Form>

                {/* VOLVER AL LOGIN */}
                <p className="text-center mt-3 mb-0 small">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    to="/login"
                    className="fw-semibold text-decoration-none"
                    style={{ color: AZUL_ACENTO }}
                  >
                    Inicia sesión
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

export default FormRegister;
