
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

import useAuthentication from "../../hooks/useAuthentication";

const FormLogin = () => {
  const { doLogin } = useAuthentication();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setCargando(true);

    try {
      await doLogin({
        email,
        password,
      });
    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
          "No se pudo iniciar sesión"
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold">
                  MiniJira
                </h2>

                <p className="text-muted">
                  Inicia sesión para continuar
                </p>
              </div>

              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Correo electrónico
                  </Form.Label>

                  <Form.Control
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    Contraseña
                  </Form.Label>

                  <Form.Control
                    type="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={cargando}
                >
                  {cargando ? (
                    <>
                      <Spinner
                        size="sm"
                        className="me-2"
                      />
                      Ingresando...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
              </Form>

              <p className="text-center mt-4 mb-0">
                ¿No tienes cuenta?{" "}
                <Link to="/register">
                  Regístrate
                </Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FormLogin;
