import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBrands } from "@/hooks/useBrands";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireBrand?: boolean;
}

const ProtectedRoute = ({ children, requireBrand = true }: ProtectedRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { brands, isLoading: brandsLoading } = useBrands();
  const location = useLocation();

  // Show loading state
  if (authLoading || brandsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but no brands and on a page that requires a brand
  if (requireBrand && brands.length === 0 && location.pathname !== "/brand-setup") {
    return <Navigate to="/brand-setup" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
