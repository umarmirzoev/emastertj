import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, DollarSign, Star, Clock, User, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function MasterDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*, service_categories(name_ru), services(name_ru)")
      .eq("master_id", user.id)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [user]);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Статус обновлён" });
      fetchOrders();
    }
  };

  const navItems = [
    { path: "/dashboard", label: "Заказы", icon: ClipboardList },
    { path: "/dashboard/profile", label: "Профиль", icon: User },
  ];

  const completedOrders = orders.filter((o) => o.status === "completed");
  const stats = [
    { label: "Всего заказов", value: orders.length, icon: ClipboardList },
    { label: "В работе", value: orders.filter((o) => ["accepted", "in_progress"].includes(o.status)).length, icon: Clock },
    { label: "Завершённых", value: completedOrders.length, icon: Star },
    { label: "Заработано", value: `${completedOrders.reduce((s, o) => s + (o.budget || 0), 0)} сом.`, icon: DollarSign },
  ];

  return (
    <DashboardLayout title={t("masterCabinet")} navItems={navItems}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-bold text-foreground mb-4">Мои заказы</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Нет назначенных заказов</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {order.services?.name_ru || order.service_categories?.name_ru || "Заказ"}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.address}</p>
                    <p className="text-sm text-muted-foreground">{order.phone}</p>
                    {order.description && <p className="text-sm text-muted-foreground mt-1">{order.description}</p>}
                  </div>
                  <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                </div>
                <div className="flex gap-2">
                  {order.status === "new" && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(order.id, "accepted")} className="rounded-full gap-1">
                        <CheckCircle className="w-3 h-3" /> Принять
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(order.id, "cancelled")} className="rounded-full gap-1">
                        <XCircle className="w-3 h-3" /> Отклонить
                      </Button>
                    </>
                  )}
                  {order.status === "accepted" && (
                    <Button size="sm" onClick={() => updateStatus(order.id, "in_progress")} className="rounded-full gap-1">
                      Начать работу
                    </Button>
                  )}
                  {order.status === "in_progress" && (
                    <Button size="sm" onClick={() => updateStatus(order.id, "completed")} className="rounded-full gap-1">
                      <CheckCircle className="w-3 h-3" /> Завершить
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
