import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import MasterDashboard from "@/components/dashboard/MasterDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import SuperAdminDashboard from "@/components/dashboard/SuperAdminDashboard";

const Dashboard = () => {
  const { user, loading, hasRole } = useAuth();
  const navigate = useNavigate();
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [checkingApproval, setCheckingApproval] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  // Check approval status for masters
  useEffect(() => {
    const check = async () => {
      if (!user) return;
      // Only check if user has master role
      if (hasRole("master")) {
        const { data } = await supabase.from("profiles").select("approval_status").eq("user_id", user.id).single();
        setApprovalStatus(data?.approval_status || "active");
      } else {
        setApprovalStatus("active");
      }
      setCheckingApproval(false);
    };
    if (user && !loading) check();
  }, [user, loading, hasRole]);

  if (loading || checkingApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  // Block pending masters
  if (hasRole("master") && approvalStatus === "pending") {
    navigate("/pending-approval");
    return null;
  }

  if (hasRole("super_admin")) return <SuperAdminDashboard />;
  if (hasRole("admin")) return <AdminDashboard />;
  if (hasRole("master")) return <MasterDashboard />;
  return <ClientDashboard />;
};

export default Dashboard;
