import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getRoles } from "../Utils/auth";

/**
 * Wraps a route and redirects if:
 * - Not logged in → /login
 * - Logged in but none of the admin's roles match allowedRoles → /unauthorized
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("authToken");
  const location = useLocation();

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check role access — admin passes if any of their roles is in allowedRoles
  if (allowedRoles) {
    const roles = getRoles();
    const hasAccess = roles.some((r) => allowedRoles.includes(r));
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
