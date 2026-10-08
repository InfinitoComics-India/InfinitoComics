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

  const roles = getRoles();
  const isShopOnly = roles.length > 0 && roles.every(r => r === "shop_admin");
  const isEmp = roles.includes("employee");
  const currentPath = location.pathname;
  const normalizedPath = currentPath.replace(/^\/admin/, "") || "/";

  // Root landing page: direct shop_admin and employee to shop management
  if (normalizedPath === "/" || normalizedPath === "") {
    if (roles.includes("shop_admin") || (isEmp && !roles.includes("superadmin"))) {
      return <Navigate to="/shop/products" replace />;
    }
  }

  // Shop admin trying to visit outside of /shop
  if (isShopOnly && !normalizedPath.startsWith("/shop")) {
    return <Navigate to="/shop/products" replace />;
  }

  // Employee-allowed pages (HR self-service + Shop section)
  const EMPLOYEE_ALLOWED = [
    "/shop",
    "/employee-portal",
    "/hr/worklog",
    "/hr/attendance",
    "/hr/leaves",
    "/hr/goals",
    "/hr/documents",
    "/hr/self-service",
  ];
  if (isEmp && !roles.includes("superadmin") && !EMPLOYEE_ALLOWED.some(a => normalizedPath.startsWith(a))) {
    return <Navigate to="/shop/products" replace />;
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
