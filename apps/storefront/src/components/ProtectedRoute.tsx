import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";
import { PageSpinner } from "./ui/Spinner";

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <PageSpinner />;
  if (status === "guest") return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}
