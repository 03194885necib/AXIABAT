import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children, roles = [], redirectTo = "/login" }) {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f8fafc",
        gap: 16,
        fontFamily: "Inter, sans-serif"
      }}>
        <div style={{
          width: 44,
          height: 44,
          border: "4px solid #e2e8f0",
          borderTop: "4px solid #1e40af",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <p style={{ color: "#64748b", fontSize: 14 }}>Chargement...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Block inactive accounts even if Firebase session is still alive
  if (userProfile && userProfile.actif === false) {
    return <Navigate to="/login" state={{ inactive: true }} replace />;
  }

  if (roles.length > 0 && !roles.includes(userProfile?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
