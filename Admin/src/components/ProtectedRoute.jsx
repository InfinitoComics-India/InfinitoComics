import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// Bulletproof role reader — works even if roles array is empty (old accounts)
const getAdminRoles = (token) => {
  try {
    const admin = JSON.parse(localStorage.getItem("Admin") || "{}");
    if (Array.isArray(admin.roles) && admin.roles.length > 0) return admin.roles;
    if (admin.role) return [admin.role];
    // JWT fallback
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (Array.isArray(payload.roles) && payload.roles.length > 0) return payload.roles;
    if (payload.role) return [payload.role];
  } catch {}
  return [];
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token    = localStorage.getItem("authToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const roles    = getAdminRoles(token);
  const empOnly  = roles.length > 0 && roles.every(r => r === "employee");
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
