import React from "react";
import { Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ roleRequired, children }) {
  const [cookies] = useCookies(["token"]);

  // Jika token tidak ada, alihkan ke halaman sign-in
  if (!cookies.token) {
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(cookies.token);
    const userRole = decodedToken.role;

    if (userRole !== roleRequired) {
      return <Navigate to="/login" />;
    }

    return children;
  } catch (error) {
    console.error("Error decoding token:", error);
    return <Navigate to="/login" />;
  }
}

export default ProtectedRoute;
