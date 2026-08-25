// Role definitions — maps each role to the routes it can access
export const ROLES = {
  superadmin:       ["*"],  // all routes
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

// Get the role string
export const getRole = () => getAdmin()?.role || null;

// Check if the current admin can access a given path prefix
export const canAccess = (path) => {
  const role = getRole();
  if (!role) return false;
  const allowed = ROLES[role] || [];
  if (allowed.includes("*")) return true;
  return allowed.some((prefix) => path.startsWith(prefix));
};
