import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./admin.css"; // Import the custom CSS

const AdminUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const adminEmail = location.state?.email || "Admin";

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadSuccess(false);
    setUploadError(null);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      setUploadError("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("adminEmail", adminEmail);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        setUploadSuccess(true);
        setUploadError(null);
      } else {
        setUploadError(
          `Failed to upload file. Server responded with status ${response.status}`
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        `Failed to upload file. Please try again. ${
          error.response ? error.response.data : error.message
        }`
      );
      setUploadSuccess(false);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="admin-page">
      <div className="welcome-message text-center mb-4">
        <h2>Welcome, {adminEmail}</h2>
      </div>

      <Button
        variant="outline-primary"
        onClick={handleLogout}
        className="logout-button"
      >
        Logout
      </Button>

      <Container className="admin-upload-container mt-5">
        <div className="upload-form border p-4 rounded">
          {uploadSuccess && (
            <Alert variant="success">File uploaded successfully!</Alert>
          )}
          {uploadError && <Alert variant="danger">{uploadError}</Alert>}
          <Form onSubmit={handleUpload} className="text-center">
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Select Excel File</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              className="w-100 mt-3"
              style={{ backgroundColor: "#364bc5" }}
            >
              Upload
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default AdminUpload;
