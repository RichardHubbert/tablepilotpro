import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const RequireManager = ({ children }: { children: React.ReactNode }) => {
  const { isManager, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isManager) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default RequireManager;
