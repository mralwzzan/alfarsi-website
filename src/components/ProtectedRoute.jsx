import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

export default function ProtectedRoute({ children, ownerOnly = false, staffOnly = false }) {
  const { user, isOwner, isStaff, loading, roleLoading } = useAuth();
  const { t } = useLang();

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        {t('client.loading')}
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (ownerOnly && !isOwner) return <Navigate to="/dashboard" replace />;
  if (staffOnly && !isStaff) return <Navigate to="/dashboard" replace />;

  return children;
}
