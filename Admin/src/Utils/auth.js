// Role definitions — maps each role to the routes it can access
export const ROLE_ROUTES = {
  superadmin:       ["*"],
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
  if (!admin) return [];
  // New format: roles is an array
  if (Array.isArray(admin.roles)) return admin.roles;
  // Old format: role is a string
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
