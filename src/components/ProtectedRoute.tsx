import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, session, userRoles, isLoading } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [serverVerifiedRoles, setServerVerifiedRoles] = useState<string[]>([]);
  const [verificationComplete, setVerificationComplete] = useState(false);

  // Server-side role verification on mount and route change
  useEffect(() => {
    const verifyRolesFromServer = async () => {
      if (user && !isLoading) {
        try {
          // Re-fetch roles directly from server to prevent client-side manipulation
          const { data: roles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
          
          if (!error && roles) {
            setServerVerifiedRoles(roles.map((r: any) => r.role));
          }
        } catch (error) {
          console.error('Role verification failed:', error);
        } finally {
          setVerificationComplete(true);
          setIsCheckingAuth(false);
        }
      } else if (!isLoading) {
        setIsCheckingAuth(false);
        setVerificationComplete(true);
      }
    };

    verifyRolesFromServer();
  }, [user, isLoading, location.pathname]);

  if (isLoading || isCheckingAuth || !verificationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated at all
  if (!session || !user) {
    return <Navigate to={`/login/${requiredRole || 'admin'}`} state={{ from: location }} replace />;
  }

  // Check if user has required role using server-verified roles
  if (requiredRole && !serverVerifiedRoles.includes(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page. Required role: {requiredRole}
          </p>
          <p className="text-sm text-muted-foreground">
            Your roles: {serverVerifiedRoles.join(', ') || 'None'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
