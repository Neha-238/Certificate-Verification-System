import React, { useState } from "react";
import axios from "axios";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import "./search.css";
import { generatePDF } from "../generatePDF";

const Search = () => {
  const [certificateId, setCertificateId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = location.state?.email || "User";

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchResult(null);
    setError("");

    if (!certificateId.trim()) {
      setError("Please enter a certificate ID");
      return;
    }

    try {
      console.log("Searching for certificate ID:", certificateId); // Debugging line
      const response = await axios.get(
        `http://localhost:5000/api/certificate/student_data/${certificateId}`
      );
      console.log("API Response:", response.data); // Debugging line

      if (response.status === 200 && response.data) {
        setSearchResult(response.data);
      } else {
        setError("Certificate not found");
      }
    } catch (error) {
      console.error("Search error:", error); // Debugging line
      if (error.response && error.response.status === 404) {
        setError("Certificate not found");
      } else {
        setError("An error occurred while searching for the certificate");
      }
    }
  };

  const handleDownload = async (certificateData) => {
    try {
      const url = await generatePDF(certificateData);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${certificateData.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="search-page">
      <div className="welcome-message text-center mb-4">
        <h2>Welcome, {userEmail}</h2>
      </div>

      <div className="text-center mb-4">
        <Button
          variant="outline-primary"
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>

      <Container className="search-container mt-5">
        <div className="search-form border p-4 rounded">
          <Form onSubmit={handleSearch}>
            <Form.Group controlId="formCertificateId">
              <Form.Label>Certificate ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter certificate ID"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mt-3">
              Search
            </Button>
            {error && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}
            {searchResult && !error && (
              <div className="mt-4">
                <h4>Certificate Details</h4>
                <p>
                  <strong>ID:</strong> {searchResult.certificateId}
                </p>
                <p>
                  <strong>Name:</strong> {searchResult.name}
                </p>
                <p>
                  <strong>Domain:</strong> {searchResult.internshipDomain}
                </p>
                <p>
                  <strong>Start Date:</strong>{" "}
                  {new Date(
                    searchResult.internshipStartDate
                  ).toLocaleDateString()}
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  {new Date(
                    searchResult.internshipEndDate
                  ).toLocaleDateString()}
                </p>
                <Button
                  variant="success"
                  onClick={() => handleDownload(searchResult)}
                  className="mt-3"
                  style={{
                    backgroundColor: "#FF7700",
                    borderColor: "#FF7700",
                    color: "white",
                  }}
                >
                  Download Certificate
                </Button>
              </div>
            )}
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default Search;
