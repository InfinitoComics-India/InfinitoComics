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

  const roles = getAdminRoles(token);
  const empOnly = roles.length > 0 && roles.every(r => r === "employee");
  const currentPath = location.pathname;

  // Employee-allowed HR pages (everything else → Employee Portal)
  const EMPLOYEE_ALLOWED = [
    "/employee-portal",
    "/hr/worklog",
    "/hr/attendance",
    "/hr/leaves",
    "/hr/goals",
    "/hr/documents",
    "/hr/self-service",
  ];
  const normalizedPath = currentPath.replace(/^\/admin/, "") || "/";
  if (empOnly && !EMPLOYEE_ALLOWED.some(a => normalizedPath.startsWith(a))) {
    return <Navigate to="/employee-portal" replace />;
  }

  if (allowedRoles) {
    const hasAccess = roles.some((r) => allowedRoles.includes(r));
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
