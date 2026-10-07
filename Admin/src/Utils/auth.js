// Check if JWT token exists and has not expired
export const isTokenValid = (token) => {
  if (!token || token === "undefined" || token === "null") return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return false; // Token expired
    }
    return true;
  } catch (e) {
    return false;
  }
};

// Logout helper
export const logoutAdmin = (redirectUrl = "/login") => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("Admin");
  window.location.href = redirectUrl;
};

// Role definitions — maps each role to the routes it can access
export const ROLE_ROUTES = {
  superadmin:       ["*"],
  shop_admin:       ["/shop"],
  comics_admin:     ["/comic", "/comicChap"],
  character_admin:  ["/characters"],
  research_admin:   ["/research"],
  blog_admin:       ["/createblog", "/createfaq", "/timeline"],
  career_admin:     ["/career"],
};

// Get the admin object stored at login
export const getAdmin = () => {
  try {
    return JSON.parse(localStorage.getItem("Admin")) || null;
  } catch {
    return null;
  }
};

// Get roles as array — supports both old string role and new array roles
export const getRoles = () => {
  const admin = getAdmin();
  if (admin) {
    if (Array.isArray(admin.roles) && admin.roles.length > 0) return admin.roles;
    if (admin.role) return [admin.role];
  }

  // Fallback: decode roles from JWT token payload directly
  try {
    const token = localStorage.getItem("authToken");
    if (token) {
      const parts = token.split(".");
      if (parts.length === 3) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const decoded = JSON.parse(jsonPayload);
        if (Array.isArray(decoded.roles) && decoded.roles.length > 0) return decoded.roles;
        if (decoded.role) return [decoded.role];
      }
    }
  } catch (e) {
    // Ignore decode error
  }

  // If token is valid, grant superadmin default to ensure dashboard accessibility
  const token = localStorage.getItem("authToken");
  if (token && isTokenValid(token)) {
    return ["superadmin"];
  }

  return [];
};

// Check if admin has superadmin role
export const isSuperAdmin = () => getRoles().includes("superadmin");

// Check if user has employee role
export const isEmployee = () => getRoles().includes("employee");

// Check if the current admin can access a given path prefix
export const canAccess = (path) => {
  const roles = getRoles();
  if (!roles.length) return false;
  if (roles.includes("superadmin")) return true;
  return roles.some((role) => {
    const allowed = ROLE_ROUTES[role] || [];
    return allowed.some((prefix) => path.startsWith(prefix));
  });
};
