
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
} from "react-bootstrap";

import useAuthentication from "../../hooks/useAuthentication";

const FormRegister = () => {
  const { doRegister } = useAuthentication();

  const [nombreCompleto, setNombreCompleto] =
    useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();

    setCargando(true);
    setError("");

    try {
      await doRegister({
        nombreCompleto,
        email,
        password,
      });
    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
          "No se pudo registrar el usuario"
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="fw-bold">
                Crear cuenta
              </h2>

              <p className="text-muted">
                Regístrate en Gamificación
              </p>

              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Nombre completo
                  </Form.Label>

                  <Form.Control
                    value={nombreCompleto}
                    onChange={(e) =>
                      setNombreCompleto(
                        e.target.value
                      )
                    }
                    required
                    minLength={3}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>

                  <Form.Control
                    type="email"
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
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                    minLength={8}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100"
                  disabled={cargando}
                >
                  {cargando
                    ? "Registrando..."
                    : "Crear cuenta"}
                </Button>
              </Form>

              <p className="text-center mt-4">
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login">
                  Inicia sesión
                </Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FormRegister;
