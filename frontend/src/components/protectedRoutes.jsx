// components/ProtectedRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireSubscription = false }) => {
  const user = useSelector((state) => state.user);

  // user is null when not logged in, object when logged in
  if (!user) return <Navigate to="/login" replace />;
  if (requireSubscription && !user?.hasInfinitoUltimate) return <Navigate to="/ultimate" replace />;

  return children;
};

export default ProtectedRoute;
