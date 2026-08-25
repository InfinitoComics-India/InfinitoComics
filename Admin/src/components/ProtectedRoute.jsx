import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { canAccess, getRole } from "../Utils/auth";

/**
 * Wraps a route and redirects if:
 * - Not logged in → /login
 * - Logged in but role doesn't have access → /unauthorized
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("authToken");
  const location = useLocation();

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but role not allowed
  const role = getRole();
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
