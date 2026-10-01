import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getRoles, isEmployee } from "../Utils/auth";

/**
 * Wraps a route and redirects if:
 * - Not logged in → /login
 * - Employee trying to access admin routes → /employee-portal
 * - Logged in but none of the admin's roles match allowedRoles → /unauthorized
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token    = localStorage.getItem("authToken");
  const location = useLocation();

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const roles     = getRoles();
  const empOnly   = isEmployee();
  const currentPath = location.pathname;

  // If employee tries to access admin routes → redirect to portal
  // Exceptions: these HR pages are accessible to employees
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

  // Check role access — admin passes if any of their roles is in allowedRoles
  if (allowedRoles) {
    const hasAccess = roles.some((r) => allowedRoles.includes(r));
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
