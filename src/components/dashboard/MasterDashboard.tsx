import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, DollarSign, Star, Clock, User, CheckCircle, XCircle, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  accepted: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  reviewed: "bg-violet-100 text-violet-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  new: "Новый",
  accepted: "Принят",
  in_progress: "В работе",
  completed: "Завершён",
  reviewed: "Оценён",
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
  useRealtimeOrders({ userId: user?.id, role: "master", onUpdate: fetchOrders });

  const updateStatus = async (orderId: string, status: string, order: any) => {
    const updateData: any = { status };
    if (status === "accepted") updateData.accepted_at = new Date().toISOString();
    if (status === "in_progress") updateData.started_at = new Date().toISOString();
    if (status === "completed") updateData.completed_at = new Date().toISOString();

    const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Статус обновлён" });

      // Notify client
      const statusText = statusLabels[status] || status;
      await supabase.from("notifications").insert({
        user_id: order.client_id,
        title: "Статус обновлён",
        message: `Ваш заказ — ${statusText}`,
        type: "status_change",
        related_id: orderId,
      });

      fetchOrders();
    }
  };

  const navItems = [
    { path: "/dashboard", label: "Заказы", icon: ClipboardList },
    { path: "/dashboard/profile", label: "Профиль", icon: User },
  ];

  const completedOrders = orders.filter((o) => ["completed", "reviewed"].includes(o.status));
  const stats = [
    { label: "Всего заказов", value: orders.length, icon: ClipboardList },
    { label: "В работе", value: orders.filter((o) => ["accepted", "in_progress"].includes(o.status)).length, icon: Clock },
    { label: "Завершённых", value: completedOrders.length, icon: Star },
    { label: "Заработано", value: `${completedOrders.reduce((s, o) => s + (o.budget || 0), 0)} сом.`, icon: DollarSign },
  ];

  return (
    <DashboardLayout title={t("masterCabinet")} navItems={navItems}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { ...stats[0], gradient: "from-blue-500/15 to-sky-500/15", iconColor: "text-blue-600", iconBg: "bg-blue-500/15" },
          { ...stats[1], gradient: "from-amber-500/15 to-yellow-500/15", iconColor: "text-amber-600", iconBg: "bg-amber-500/15" },
          { ...stats[2], gradient: "from-emerald-500/15 to-green-500/15", iconColor: "text-emerald-600", iconBg: "bg-emerald-500/15" },
          { ...stats[3], gradient: "from-violet-500/15 to-purple-500/15", iconColor: "text-violet-600", iconBg: "bg-violet-500/15" },
        ].map((s, i) => (
          <Card key={i} className={`bg-gradient-to-br ${s.gradient} border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]`}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
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
                      <Button size="sm" onClick={() => updateStatus(order.id, "accepted", order)} className="rounded-full gap-1">
                        <CheckCircle className="w-3 h-3" /> Принять
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(order.id, "cancelled", order)} className="rounded-full gap-1">
                        <XCircle className="w-3 h-3" /> Отклонить
                      </Button>
                    </>
                  )}
                  {order.status === "accepted" && (
                    <Button size="sm" onClick={() => updateStatus(order.id, "in_progress", order)} className="rounded-full gap-1">
                      <Play className="w-3 h-3" /> Начать работу
                    </Button>
                  )}
                  {order.status === "in_progress" && (
                    <Button size="sm" onClick={() => updateStatus(order.id, "completed", order)} className="rounded-full gap-1">
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
