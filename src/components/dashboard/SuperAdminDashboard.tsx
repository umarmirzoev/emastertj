import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutDashboard, ClipboardList, Users, UserCheck, Wrench, Star as StarIcon,
  Shield, Settings, BarChart3, Search, DollarSign,
  CheckCircle, XCircle, TrendingUp, TrendingDown, Calendar,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const statusLabels: Record<string, string> = {
  new: "Новый", accepted: "Принят", assigned: "Назначен",
  on_the_way: "В пути", arrived: "Прибыл", in_progress: "В работе",
  completed: "Завершён", reviewed: "Оценён", cancelled: "Отменён",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800", accepted: "bg-yellow-100 text-yellow-800",
  assigned: "bg-indigo-100 text-indigo-800", on_the_way: "bg-cyan-100 text-cyan-800",
  arrived: "bg-teal-100 text-teal-800", in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800", reviewed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const chartColors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

type Tab = "overview" | "analytics" | "orders" | "admins" | "users" | "masters" | "reviews" | "pending";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pendingMasters, setPendingMasters] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [masters, setMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string; name: string } | null>(null);
  const [dateRange, setDateRange] = useState("month");

  const loadData = async () => {
    setLoading(true);
    const [ordersRes, usersRes, catsRes, pendingRes, reviewsRes, mastersRes] = await Promise.all([
      supabase.from("orders").select("*, service_categories(name_ru), services(name_ru)").order("created_at", { ascending: false }).limit(1000),
      supabase.from("profiles").select("*, user_roles(role)").limit(500),
      supabase.from("service_categories").select("*, services(count)").order("sort_order"),
      supabase.from("profiles").select("*").eq("approval_status", "pending"),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("master_listings").select("id, full_name, average_rating, user_id").eq("is_active", true).limit(500),
    ]);
    setOrders(ordersRes.data || []);
    setAllUsers(usersRes.data || []);
    setCategories(catsRes.data || []);
    setPendingMasters(pendingRes.data || []);
    setReviews(reviewsRes.data || []);
    setMasters(mastersRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);
  useRealtimeOrders({ userId: user?.id, role: "admin", onUpdate: loadData });

  const approveMaster = async (userId: string) => {
    await supabase.from("profiles").update({ approval_status: "active" }).eq("user_id", userId);
    toast({ title: "Мастер одобрен" }); loadData();
  };
  const rejectMaster = async (userId: string) => {
    await supabase.from("profiles").update({ approval_status: "rejected" }).eq("user_id", userId);
    toast({ title: "Мастер отклонён" }); loadData();
  };

  // Analytics calculations
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  const monthAgo = new Date(today.getTime() - 30 * 86400000);

  const completedOrders = orders.filter(o => o.status === "completed" || o.status === "reviewed");
  const cancelledOrders = orders.filter(o => o.status === "cancelled");
  const activeOrders = orders.filter(o => !["completed", "cancelled", "reviewed"].includes(o.status));
  const revenue = completedOrders.reduce((s, o) => s + (o.budget || 0), 0);

  const todayOrders = orders.filter(o => new Date(o.created_at) >= today);
  const weekOrders = orders.filter(o => new Date(o.created_at) >= weekAgo);
  const monthOrders = orders.filter(o => new Date(o.created_at) >= monthAgo);

  const todayRevenue = completedOrders.filter(o => new Date(o.completed_at || o.created_at) >= today).reduce((s, o) => s + (o.budget || 0), 0);
  const weekRevenue = completedOrders.filter(o => new Date(o.completed_at || o.created_at) >= weekAgo).reduce((s, o) => s + (o.budget || 0), 0);
  const monthRevenue = completedOrders.filter(o => new Date(o.completed_at || o.created_at) >= monthAgo).reduce((s, o) => s + (o.budget || 0), 0);

  const admins = allUsers.filter(u => u.user_roles?.some((r: any) => r.role === "admin" || r.role === "super_admin"));
  const clients = allUsers.filter(u => u.user_roles?.some((r: any) => r.role === "client"));

  // Orders by day chart data (last 14 days)
  const ordersByDay = useMemo(() => {
    const days: { date: string; orders: number; completed: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const dateStr = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
      const dayOrders = orders.filter(o => {
        const od = new Date(o.created_at);
        return od.toDateString() === d.toDateString();
      });
      const dayCompleted = dayOrders.filter(o => o.status === "completed" || o.status === "reviewed");
      days.push({ date: dateStr, orders: dayOrders.length, completed: dayCompleted.length });
    }
    return days;
  }, [orders]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
    }));
  }, [orders]);

  // Category distribution
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      const name = o.service_categories?.name_ru || "Другое";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [orders]);

  const navItems = [
    { path: "/dashboard", label: "Панель", icon: LayoutDashboard },
    { path: "/dashboard/analytics", label: "Аналитика", icon: BarChart3 },
    { path: "/dashboard/orders", label: "Заказы", icon: ClipboardList },
    { path: "/dashboard/admins", label: "Админы", icon: Shield },
    { path: "/dashboard/users", label: "Пользователи", icon: Users },
    { path: "/dashboard/masters", label: "Мастера", icon: Wrench },
    { path: "/dashboard/reviews", label: "Отзывы", icon: StarIcon },
    { path: "/dashboard/settings", label: "Настройки", icon: Settings },
  ];

  const mainStats = [
    { label: "Всего заказов", value: orders.length, icon: ClipboardList, gradient: "from-blue-500/10 to-sky-500/10", iconColor: "text-blue-600", iconBg: "bg-blue-500/10" },
    { label: "Активных", value: activeOrders.length, icon: TrendingUp, gradient: "from-amber-500/10 to-yellow-500/10", iconColor: "text-amber-600", iconBg: "bg-amber-500/10" },
    { label: "Завершённых", value: completedOrders.length, icon: CheckCircle, gradient: "from-emerald-500/10 to-green-500/10", iconColor: "text-emerald-600", iconBg: "bg-emerald-500/10" },
    { label: "Отменённых", value: cancelledOrders.length, icon: XCircle, gradient: "from-red-500/10 to-rose-500/10", iconColor: "text-red-600", iconBg: "bg-red-500/10" },
    { label: "Клиентов", value: clients.length, icon: Users, gradient: "from-violet-500/10 to-purple-500/10", iconColor: "text-violet-600", iconBg: "bg-violet-500/10" },
    { label: "Мастеров", value: masters.length, icon: Wrench, gradient: "from-orange-500/10 to-red-500/10", iconColor: "text-orange-600", iconBg: "bg-orange-500/10" },
    { label: "Админов", value: admins.length, icon: Shield, gradient: "from-rose-500/10 to-pink-500/10", iconColor: "text-rose-600", iconBg: "bg-rose-500/10" },
    { label: "Отзывов", value: reviews.length, icon: StarIcon, gradient: "from-cyan-500/10 to-teal-500/10", iconColor: "text-cyan-600", iconBg: "bg-cyan-500/10" },
  ];

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "overview", label: "Обзор", icon: LayoutDashboard },
    { key: "analytics", label: "Аналитика", icon: BarChart3 },
    { key: "orders", label: "Заказы", icon: ClipboardList },
    { key: "admins", label: "Админы", icon: Shield },
    { key: "users", label: "Пользователи", icon: Users },
    { key: "masters", label: "Мастера", icon: Wrench },
    { key: "reviews", label: "Отзывы", icon: StarIcon },
    { key: "pending", label: `Заявки (${pendingMasters.length})`, icon: UserCheck },
  ];

  return (
    <DashboardLayout title="Суперадмин" navItems={navItems}>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {mainStats.map((s, i) => (
          <Card key={i} className={`bg-gradient-to-br ${s.gradient} border-0 shadow-sm`}>
            <CardContent className="p-3">
              <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center mb-1.5`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 border-b border-border pb-2 overflow-x-auto scrollbar-hide">
        {tabs.map(tb => {
          const Icon = tb.icon;
          return (
            <Button key={tb.key} variant={tab === tb.key ? "default" : "ghost"} size="sm" onClick={() => setTab(tb.key)} className="rounded-full whitespace-nowrap gap-1.5 shrink-0 text-xs">
              <Icon className="w-3.5 h-3.5" />
              {tb.label}
            </Button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : tab === "overview" ? (
        <div className="space-y-6">
          {/* Revenue cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">
              <CardContent className="p-5">
                <DollarSign className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-3xl font-bold">{todayRevenue.toLocaleString()} <span className="text-sm font-normal opacity-80">сом.</span></p>
                <p className="text-sm opacity-80">Доход сегодня</p>
                <p className="text-xs opacity-60 mt-1">{todayOrders.length} заказов</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-5">
                <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-3xl font-bold">{weekRevenue.toLocaleString()} <span className="text-sm font-normal opacity-80">сом.</span></p>
                <p className="text-sm opacity-80">Доход за неделю</p>
                <p className="text-xs opacity-60 mt-1">{weekOrders.length} заказов</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <CardContent className="p-5">
                <BarChart3 className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-3xl font-bold">{monthRevenue.toLocaleString()} <span className="text-sm font-normal opacity-80">сом.</span></p>
                <p className="text-sm opacity-80">Доход за месяц</p>
                <p className="text-xs opacity-60 mt-1">{monthOrders.length} заказов</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Заказы за 14 дней</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={ordersByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Заказов" />
                    <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Завершённых" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">По статусам</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={statusDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {statusDistribution.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top categories */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Популярные категории</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Заказов" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : tab === "analytics" ? (
        <div className="space-y-6">
          {/* Revenue analytics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Доход сегодня</p>
                <p className="text-2xl font-bold text-emerald-600">{todayRevenue.toLocaleString()} сом.</p>
                <p className="text-xs text-muted-foreground">{todayOrders.length} заказов</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Доход за неделю</p>
                <p className="text-2xl font-bold text-blue-600">{weekRevenue.toLocaleString()} сом.</p>
                <p className="text-xs text-muted-foreground">{weekOrders.length} заказов</p>
              </CardContent>
            </Card>
            <Card className="border-violet-200 dark:border-violet-800">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Доход за месяц</p>
                <p className="text-2xl font-bold text-violet-600">{monthRevenue.toLocaleString()} сом.</p>
                <p className="text-xs text-muted-foreground">{monthOrders.length} заказов</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Общий доход</p>
                <p className="text-2xl font-bold text-amber-600">{revenue.toLocaleString()} сом.</p>
                <p className="text-xs text-muted-foreground">{completedOrders.length} завершённых</p>
              </CardContent>
            </Card>
          </div>

          {/* Orders trend */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Тренд заказов</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ordersByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} name="Заказов" />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} name="Завершённых" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Распределение по статусам</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {statusDistribution.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors[i % chartColors.length] }} />
                        <span className="text-sm">{s.name}</span>
                      </div>
                      <span className="font-semibold text-sm">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Ключевые метрики</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20">
                    <span className="text-sm">Конверсия завершённых</span>
                    <span className="font-bold text-emerald-600">{orders.length > 0 ? ((completedOrders.length / orders.length) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                    <span className="text-sm">Процент отмен</span>
                    <span className="font-bold text-red-600">{orders.length > 0 ? ((cancelledOrders.length / orders.length) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                    <span className="text-sm">Средний чек</span>
                    <span className="font-bold text-blue-600">{completedOrders.length > 0 ? Math.round(revenue / completedOrders.length) : 0} сом.</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                    <span className="text-sm">Средний рейтинг</span>
                    <span className="font-bold text-amber-600">{reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—"} ⭐</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : tab === "orders" ? (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Поиск заказов..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="space-y-2">
            {orders.filter(o => !search || o.address?.toLowerCase().includes(search.toLowerCase()) || o.phone?.includes(search)).slice(0, 50).map(o => (
              <Card key={o.id}>
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{o.services?.name_ru || o.service_categories?.name_ru || "Заказ"}</p>
                    <p className="text-xs text-muted-foreground">{o.address} • {new Date(o.created_at).toLocaleDateString("ru-RU")}</p>
                  </div>
                  <Badge className={`${statusColors[o.status]} text-[10px] shrink-0`}>{statusLabels[o.status]}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : tab === "admins" ? (
        <div className="space-y-3">
          {admins.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Нет администраторов</CardContent></Card>
          ) : admins.map(a => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{a.full_name || "—"}</p>
                    <p className="text-sm text-muted-foreground">{a.phone || "—"}</p>
                  </div>
                </div>
                {a.user_roles?.map((r: any, i: number) => (
                  <Badge key={i} className={r.role === "super_admin" ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"}>
                    {r.role === "super_admin" ? "Суперадмин" : "Админ"}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tab === "users" ? (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="space-y-2">
            {allUsers.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase())).map(u => (
              <Card key={u.id}>
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
                    <div><p className="text-sm font-medium">{u.full_name || "—"}</p><p className="text-[11px] text-muted-foreground">{u.phone || "—"}</p></div>
                  </div>
                  <div className="flex gap-1">{u.user_roles?.map((r: any, i: number) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{r.role === "super_admin" ? "Суперадмин" : r.role === "admin" ? "Админ" : r.role === "master" ? "Мастер" : "Клиент"}</Badge>
                  ))}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : tab === "masters" ? (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Поиск мастеров..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="space-y-2">
            {masters.filter(m => !search || m.full_name?.toLowerCase().includes(search.toLowerCase())).map(m => (
              <Card key={m.id}>
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center"><Wrench className="w-4 h-4 text-orange-600" /></div>
                    <div><p className="text-sm font-medium">{m.full_name}</p><p className="text-[11px] text-muted-foreground flex items-center gap-1"><StarIcon className="w-3 h-3 fill-yellow-400 text-yellow-400" />{m.average_rating}</p></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : tab === "reviews" ? (
        <div className="space-y-2">
          {reviews.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Нет отзывов</CardContent></Card>
          ) : reviews.slice(0, 50).map(r => (
            <Card key={r.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />)}
                </div>
                {r.comment && <p className="text-sm text-foreground">{r.comment}</p>}
                <p className="text-[11px] text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString("ru-RU")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tab === "pending" ? (
        pendingMasters.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Нет заявок</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {pendingMasters.map(m => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold">{m.full_name || "—"}</p>
                      <p className="text-sm text-muted-foreground">{m.phone}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">Ожидает</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setConfirmAction({ type: "approve", id: m.user_id, name: m.full_name })} className="rounded-full gap-1"><CheckCircle className="w-3 h-3" /> Одобрить</Button>
                    <Button size="sm" variant="destructive" onClick={() => setConfirmAction({ type: "reject", id: m.user_id, name: m.full_name })} className="rounded-full gap-1"><XCircle className="w-3 h-3" /> Отклонить</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : null}

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.type === "approve" ? "Одобрить?" : "Отклонить?"}</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction?.name}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Отмена</AlertDialogCancel>
            <AlertDialogAction className="rounded-full" onClick={() => { if (confirmAction?.type === "approve") approveMaster(confirmAction.id); else if (confirmAction) rejectMaster(confirmAction.id); setConfirmAction(null); }}>
              {confirmAction?.type === "approve" ? "Одобрить" : "Отклонить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
