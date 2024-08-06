import React, { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import AdminUpload from "./pages/admin";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Search from "./pages/search";

function App() {
  const [loggedInAdminEmail, setLoggedInAdminEmail] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (email, role) => {
    setLoggedInAdminEmail(email);
    if (role === "Admin") {
      navigate("/admin", { state: { email } }); // Pass email to AdminUpload via state
    } else {
      navigate("/search", { state: { email } }); // Pass email to Search via state
    }
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route
          path="/admin"
          element={<AdminUpload adminEmail={loggedInAdminEmail} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App; // Ensure this is present
