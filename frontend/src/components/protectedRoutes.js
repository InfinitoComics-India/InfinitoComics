// components/ProtectedRoute.js
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireSubscription = false }) => {
  const user = useSelector((state) => state.user);

  if (!user?.isLoggedIn) return <Navigate to="/login" replace />;
  if (requireSubscription && !user?.isSubscribed) return <Navigate to="/loggedin" replace />;

  return children;
};

export default ProtectedRoute;
