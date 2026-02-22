import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Plus, Star, Clock, User, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { useToast } from "@/hooks/use-toast";
import ReviewModal from "./ReviewModal";

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

export default function ClientDashboard() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState<any>(null);

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

  const cancelOrder = async (orderId: string) => {
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    if (error) toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    else { toast({ title: "Заказ отменён" }); fetchOrders(); }
  };

  const navItems = [
    { path: "/dashboard", label: "Мои заказы", icon: ClipboardList },
    { path: "/dashboard/profile", label: "Профиль", icon: User },
  ];

  const stats = [
    { label: "Всего заказов", value: orders.length, icon: ClipboardList },
    { label: "Активных", value: orders.filter((o) => !["completed", "cancelled", "reviewed"].includes(o.status)).length, icon: Clock },
    { label: "Завершённых", value: orders.filter((o) => ["completed", "reviewed"].includes(o.status)).length, icon: Star },
  ];

  return (
    <DashboardLayout title={t("clientCabinet")} navItems={navItems}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { ...stats[0], gradient: "from-blue-500/15 to-sky-500/15", iconColor: "text-blue-600", iconBg: "bg-blue-500/15" },
          { ...stats[1], gradient: "from-amber-500/15 to-yellow-500/15", iconColor: "text-amber-600", iconBg: "bg-amber-500/15" },
          { ...stats[2], gradient: "from-emerald-500/15 to-green-500/15", iconColor: "text-emerald-600", iconBg: "bg-emerald-500/15" },
        ].map((s, i) => (
          <Card key={i} className={`bg-gradient-to-br ${s.gradient} border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]`}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Мои заказы</h2>
        <Button onClick={() => navigate("/categories")} size="sm" className="rounded-full gap-2">
          <Plus className="w-4 h-4" /> Новый заказ
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">У вас пока нет заказов</p>
            <Button onClick={() => navigate("/categories")} className="rounded-full">
              <Plus className="w-4 h-4 mr-2" /> Создать первый заказ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
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
                <div className="flex gap-2">
                  {order.status === "new" && (
                    <Button size="sm" variant="destructive" onClick={() => cancelOrder(order.id)} className="rounded-full gap-1">
                      <XCircle className="w-3 h-3" /> Отменить
                    </Button>
                  )}
                  {order.status === "completed" && order.master_id && (
                    <Button size="sm" onClick={() => setReviewOrder(order)} className="rounded-full gap-1">
                      <Star className="w-3 h-3" /> Оставить отзыв
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reviewOrder && (
        <ReviewModal
          isOpen={!!reviewOrder}
          onClose={() => setReviewOrder(null)}
          orderId={reviewOrder.id}
          masterId={reviewOrder.master_id}
          clientId={user!.id}
          onSubmitted={fetchOrders}
        />
      )}
    </DashboardLayout>
  );
}
