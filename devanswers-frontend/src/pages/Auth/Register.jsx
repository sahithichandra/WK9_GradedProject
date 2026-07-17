import { useState, useEffect } from "react";
import { Button, Container, Card, Form, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";
import { registerUser } from "../../reducers/userSlice.js";
import "./Auth.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    userInfo,
    registration: { status: regStatus, error: regError },
  } = useSelector((state) => state.user);
  const isAuthenticated = !!userInfo;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match!");
      return;
    }

    const result = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(result)) {
      setSuccessMessage("Registration successful! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-page">
      <Container>
        <div className="d-flex justify-content-center">
          <Card className="auth-card">
            <Card.Body className="p-5">
              {successMessage && (
                <Alert variant="success" className="rounded-3">
                  {successMessage}
                </Alert>
              )}

              {(regError || localError) && (
                <Alert variant="danger" className="rounded-3">
                  {regError || localError}
                </Alert>
              )}

              <div className="text-center mb-4">
                <h2 className="auth-title">Create Account</h2>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="auth-label">
                    <FaUser className="me-2" />
                    Full Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="auth-input"
                  />
                </Form.Group>

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

                <Form.Group className="mb-3">
                  <Form.Label className="auth-label">
                    <FaLock className="me-2" />
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="auth-input"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="auth-label">
                    <FaLock className="me-2" />
                    Confirm Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="auth-input"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3 auth-btn"
                  disabled={regStatus === "pending"}
                >
                  <FaUserPlus className="me-2" />
                  {regStatus === "pending" ? "Creating Account..." : "Register"}
                </Button>

                <div className="text-center mt-3">
                  <p className="auth-footer-text">
                    Already have an account?{" "}
                    <Link to="/login" className="auth-link">
                      Login
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

export default Register;
