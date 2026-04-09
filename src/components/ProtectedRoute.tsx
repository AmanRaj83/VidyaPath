import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasCompletedOnboarding } from "@/data/onboarding";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center text-muted-foreground">
        Checking login...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const onboardingComplete = hasCompletedOnboarding(user.uid);

  if (location.pathname === "/onboarding" && onboardingComplete) {
    return <Navigate to="/" replace />;
  }

  if (location.pathname !== "/onboarding" && !onboardingComplete) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
