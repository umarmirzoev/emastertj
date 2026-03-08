import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SuperAdminDashboard from "@/components/dashboard/SuperAdminDashboard";

const SuperAdminDashboardPage = () => {
  const { user, loading, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
    if (!loading && user && !hasRole("super_admin")) navigate("/dashboard");
  }, [user, loading, hasRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !hasRole("super_admin")) return null;

  return <SuperAdminDashboard />;
};

export default SuperAdminDashboardPage;
