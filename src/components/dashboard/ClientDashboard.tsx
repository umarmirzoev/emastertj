import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Plus, Star, Clock, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  accepted: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  new: "Новый",
  accepted: "Принят",
  in_progress: "В работе",
  completed: "Завершён",
  cancelled: "Отменён",
};

export default function ClientDashboard() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*, service_categories(name_ru), services(name_ru)")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [user]);
  useRealtimeOrders({ userId: user?.id, role: "client", onUpdate: fetchOrders });

  const navItems = [
    { path: "/dashboard", label: "Мои заказы", icon: ClipboardList },
    { path: "/dashboard/profile", label: "Профиль", icon: User },
  ];

  const stats = [
    { label: "Всего заказов", value: orders.length, icon: ClipboardList },
    { label: "Активных", value: orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length, icon: Clock },
    { label: "Завершённых", value: orders.filter((o) => o.status === "completed").length, icon: Star },
  ];

  return (
    <DashboardLayout title={t("clientCabinet")} navItems={navItems}>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Мои заказы</h2>
        <Button onClick={() => navigate("/categories")} size="sm" className="rounded-full gap-2">
          <Plus className="w-4 h-4" />
          Новый заказ
        </Button>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">У вас пока нет заказов</p>
            <Button onClick={() => navigate("/categories")} className="rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Создать первый заказ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {order.services?.name_ru || order.service_categories?.name_ru || "Заказ"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{order.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <Badge className={statusColors[order.status] || "bg-muted"}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
