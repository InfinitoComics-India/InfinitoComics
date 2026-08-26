export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    // Support both new roles array and old role string
    const userRoles = Array.isArray(user.roles) && user.roles.length > 0
      ? user.roles
      : (user.role ? [user.role] : []);

    const hasAccess = userRoles.some((r) => allowedRoles.includes(r));
    if (!hasAccess) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
};
