// Role definitions — maps each role to the routes it can access
export const ROLE_ROUTES = {
  superadmin:       ["*"],
  comics_admin:     ["/comic", "/comicChap"],
  character_admin:  ["/characters"],
  research_admin:   ["/research"],
  blog_admin:       ["/createblog", "/createfaq", "/timeline"],
  career_admin:     ["/career"],
  employee:         ["/employee-portal"],
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
  if (!admin) return [];
  // New format: roles is a non-empty array
  if (Array.isArray(admin.roles) && admin.roles.length > 0) return admin.roles;
  // Old format or empty roles array: fall back to role string
  if (admin.role) return [admin.role];
  return [];
};

// Check if admin has superadmin role
export const isSuperAdmin = () => getRoles().includes("superadmin");

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

// Check if the logged-in user is a pure employee (not any admin role)
export const isEmployee = () => {
  const roles = getRoles();
  return roles.length > 0 && roles.every(r => r === "employee");
};
