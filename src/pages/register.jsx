import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import "./register.css"; // Import custom CSS
import AppNavbar from "./navbar";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        email,
        password,
        role,
      });

      if (response.status === 201) {
        setSuccess(true);
        setError(null);
      } else {
        setError("Registration failed. Please try again.");
        setSuccess(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Registration failed. Please try again.");
      setSuccess(false);
    }
  };

  return (
    <>
      <AppNavbar />
      <Container
        className="mt-5 d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="register-form border p-4 rounded">
          <h2 className="text-center mb-4" style={{ color: "#364bc5" }}>
            Register
          </h2>
          {success && <Alert variant="success">Registered successfully!</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleRegister}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formBasicRole">
              <Form.Label>Role</Form.Label>
              <Form.Control
                as="select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Student</option>
                <option>Admin</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Register
            </Button>
            <div className="text-center mt-3">
              <a href="/login">Already have an account? Login here</a>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );
};

export default Register;
