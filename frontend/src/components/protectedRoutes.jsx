// components/ProtectedRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireSubscription = false }) => {
  const user = useSelector((state) => state.user);

  // Allow if user object exists (null = logged out)
  // Also support legacy isLoggedIn flag just in case
  const isLoggedIn = user && (user.isLoggedIn !== false);
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (requireSubscription && !user?.hasInfinitoUltimate) return <Navigate to="/ultimate" replace />;

  return children;
};

export default ProtectedRoute;
