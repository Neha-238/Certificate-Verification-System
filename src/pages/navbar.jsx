import React from "react";
import { Container, Navbar, Nav } from "react-bootstrap";
import "./navbar.css"; // Import custom CSS for navbar

const AppNavbar = () => {
  return (
    <Navbar expand="lg" className="shadow-sm navbar-custom">
      <Container>
        <Navbar.Brand href="/" className="brand-custom">
          Certificate Verification System
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="navbar-toggler-custom"
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav
            className="ml-auto mx-auto"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/login">Login</Nav.Link>
            <Nav.Link href="/register">Register</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
