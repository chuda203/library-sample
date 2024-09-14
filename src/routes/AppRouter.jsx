import React, { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Lazy load the routes based on role
const AdminRoutes = lazy(() => import("./admin"));
const StudentRoutes = lazy(() => import("./student"));
const HeadMasterRoute = lazy(() => import("./headmaster"));
const GuestRoutes = lazy(() => import("./guest"));

function AppRouter() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role); // Simpan role ke state
      } catch (error) {
        console.error("Invalid token", error);
        navigate("/login");
      }
    }
  }, [navigate]);

  const getRoutesForRole = (role) => {
    switch (role) {
      case "admin":
        return <Route path="/admin/*" element={<AdminRoutes />} />;
      case "student":
        return <Route path="/student/*" element={<StudentRoutes />} />;
      case "headmaster":
        return <Route path="/headmaster/*" element={<HeadMasterRoute />} />;
      default:
        return <Route path="*" element={<GuestRoutes />} />;
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Render routes based on role */}
        {role ? (
          getRoutesForRole(role)
        ) : (
          <Route path="*" element={<GuestRoutes />} />
        )}
        {/* Default route for guests */}
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
