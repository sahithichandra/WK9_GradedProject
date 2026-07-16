import { useState, useEffect } from "react";
import { Button, Container, Card, Form, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import { loginUser } from "../../reducers/userSlice.js";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    userInfo,
    login: { status: loginStatus, error: loginError },
  } = useSelector((state) => state.user);
  const isAuthenticated = !!userInfo;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

  return (
    <div className="auth-page">
      <Container>
        <div className="d-flex justify-content-center">
          <Card className="auth-card">
            <Card.Body className="p-4 p-sm-5">
              {loginError && (
                <Alert variant="danger" className="rounded-3">
                  {loginError}
                </Alert>
              )}

              <div className="text-center mb-4">
                <h2 className="auth-title">Welcome Back!</h2>
                <p className="auth-subtitle">Login to continue to DevAnswers</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="auth-label">
                    <FaEnvelope className="me-2" />
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="auth-input"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="auth-label">
                    <FaLock className="me-2" />
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="auth-input"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3 auth-btn"
                  disabled={loginStatus === "pending"}
                >
                  <FaSignInAlt className="me-2" />
                  {loginStatus === "pending" ? "Logging in..." : "Login"}
                </Button>

                <div className="text-center mt-3">
                  <p className="auth-footer-text">
                    Don't have an account?{" "}
                    <Link to="/register" className="auth-link">
                      Sign up
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Login;
