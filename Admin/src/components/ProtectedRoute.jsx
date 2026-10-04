import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getRoles, isTokenValid } from "../Utils/auth";

/**
 * Wraps a route and redirects if:
 * - Not logged in or token expired → /login
 * - Logged in but none of the admin's roles match allowedRoles → /unauthorized
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("authToken");
  const location = useLocation();

  // Not logged in or token expired
  if (!token || !isTokenValid(token)) {
    if (token && !isTokenValid(token)) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("Admin");
    }
    return <Navigate to="/login" replace state={{ from: location, expired: true }} />;
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
