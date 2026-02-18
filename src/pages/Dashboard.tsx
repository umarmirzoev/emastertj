import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import MasterDashboard from "@/components/dashboard/MasterDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

const Dashboard = () => {
  const { user, loading, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  if (hasRole("super_admin") || hasRole("admin")) return <AdminDashboard />;
  if (hasRole("master")) return <MasterDashboard />;
  return <ClientDashboard />;
};

export default Dashboard;
