import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ClipboardList, Users, BarChart3, Settings, Star, Search,
  ShieldCheck, Wrench, DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  accepted: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  new: "Новый", accepted: "Принят", in_progress: "В работе",
  completed: "Завершён", cancelled: "Отменён",
};

type Tab = "orders" | "users" | "services";

export default function AdminDashboard() {
  const { hasRole } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const isSuperAdmin = hasRole("super_admin");

  const loadData = async () => {
    setLoading(true);
    const [ordersRes, usersRes, catsRes] = await Promise.all([
      supabase.from("orders").select("*, service_categories(name_ru), services(name_ru)").order("created_at", { ascending: false }).limit(100),
      supabase.from("profiles").select("*, user_roles(role)").limit(200),
      supabase.from("service_categories").select("*, services(count)").order("sort_order"),
    ]);
    setOrders(ordersRes.data || []);
    setUsers(usersRes.data || []);
    setCategories(catsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const { user } = useAuth();
  useRealtimeOrders({ userId: user?.id, role: "admin", onUpdate: loadData });

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    else {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      toast({ title: "Статус обновлён" });
    }
  };

  const navItems = [
    { path: "/dashboard", label: "Панель управления", icon: BarChart3 },
    { path: "/dashboard/users", label: "Пользователи", icon: Users },
    { path: "/dashboard/services", label: "Услуги", icon: Wrench },
    { path: "/dashboard/settings", label: "Настройки", icon: Settings },
  ];

  const stats = [
    { label: "Заказов", value: orders.length, icon: ClipboardList },
    { label: "Пользователей", value: users.length, icon: Users },
    { label: "Категорий", value: categories.length, icon: Wrench },
    { label: "Выручка", value: `${orders.filter(o => o.status === "completed").reduce((s, o) => s + (o.budget || 0), 0)} сом.`, icon: DollarSign },
  ];

  return (
    <DashboardLayout
      title={isSuperAdmin ? "Суперадмин" : t("admin")}
      navItems={navItems}
    >
      {/* Stats */}
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

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-border pb-2">
        {(["orders", "users", "services"] as Tab[]).map((t) => (
          <Button
            key={t}
            variant={tab === t ? "default" : "ghost"}
            size="sm"
            onClick={() => setTab(t)}
            className="rounded-full"
          >
            {t === "orders" ? "Заказы" : t === "users" ? "Пользователи" : "Услуги"}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : tab === "orders" ? (
        <div className="space-y-3">
          {orders
            .filter((o) => !search || o.address?.toLowerCase().includes(search.toLowerCase()) || o.phone?.includes(search))
            .map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {order.services?.name_ru || order.service_categories?.name_ru || "Заказ"}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.address} • {order.phone}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("ru-RU")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : tab === "users" ? (
        <div className="space-y-3">
          {users
            .filter((u) => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search))
            .map((u) => (
              <Card key={u.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{u.full_name || "—"}</p>
                    <p className="text-sm text-muted-foreground">{u.phone || "—"}</p>
                  </div>
                  <div className="flex gap-1">
                    {u.user_roles?.map((r: any, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {r.role === "super_admin" ? "Суперадмин" : r.role === "admin" ? "Админ" : r.role === "master" ? "Мастер" : "Клиент"}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{cat.name_ru}</p>
                  <p className="text-sm text-muted-foreground">
                    {cat.services?.[0]?.count || 0} услуг
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
