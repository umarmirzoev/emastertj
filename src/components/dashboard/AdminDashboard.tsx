import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  LayoutDashboard, ClipboardList, Users, UserCheck, Wrench, Star as StarIcon,
  Search, DollarSign, CheckCircle, XCircle, TrendingUp, Eye, MapPin, Phone,
  Calendar, ArrowRight, Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  accepted: "bg-yellow-100 text-yellow-800",
  assigned: "bg-indigo-100 text-indigo-800",
  on_the_way: "bg-cyan-100 text-cyan-800",
  arrived: "bg-teal-100 text-teal-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  reviewed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  new: "Новый",
  accepted: "Принят",
  assigned: "Назначен",
  on_the_way: "В пути",
  arrived: "Прибыл",
  in_progress: "В работе",
  completed: "Завершён",
  reviewed: "Оценён",
  cancelled: "Отменён",
};

const statusFlow = ["new", "accepted", "assigned", "on_the_way", "arrived", "in_progress", "completed", "cancelled"];

type Tab = "overview" | "orders" | "pending" | "users" | "masters" | "reviews" | "notifications";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string; name: string } | null>(null);

  // Assign master dialog
  const [assignDialog, setAssignDialog] = useState<any>(null);
  const [selectedMasterId, setSelectedMasterId] = useState("");

  // Order detail
  const [detailOrder, setDetailOrder] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    const [ordersRes, usersRes, catsRes, pendingRes, reviewsRes, mastersRes] = await Promise.all([
      supabase.from("orders").select("*, service_categories(name_ru), services(name_ru)").order("created_at", { ascending: false }).limit(500),
      supabase.from("profiles").select("*, user_roles(role)").limit(500),
      supabase.from("service_categories").select("*, services(count)").order("sort_order"),
      supabase.from("profiles").select("*").eq("approval_status", "pending"),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("master_listings").select("id, full_name, phone, service_categories, average_rating, user_id").eq("is_active", true).order("average_rating", { ascending: false }).limit(200),
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

  const updateOrderStatus = async (orderId: string, status: string) => {
    const updateData: any = { status };
    if (status === "accepted") updateData.accepted_at = new Date().toISOString();
    if (status === "in_progress") updateData.started_at = new Date().toISOString();
    if (status === "completed") updateData.completed_at = new Date().toISOString();
    const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
    if (error) toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updateData } : o));
      toast({ title: "Статус обновлён" });

      // Notify client
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const statusMessages: Record<string, string> = {
          accepted: "Ваш заказ принят администратором",
          assigned: "К вашему заказу назначен мастер",
          on_the_way: "Мастер выехал к вам",
          arrived: "Мастер прибыл на место",
          in_progress: "Мастер начал работу",
          completed: "Ваш заказ завершён",
        };
        if (statusMessages[status]) {
          await supabase.from("notifications").insert({
            user_id: order.client_id,
            title: "Обновление заказа",
            message: statusMessages[status],
            type: "order_status",
            related_id: orderId,
          });
        }
      }
    }
  };

  const assignMaster = async () => {
    if (!assignDialog || !selectedMasterId) return;
    const { error } = await supabase.from("orders").update({
      master_id: selectedMasterId,
      status: "assigned",
    }).eq("id", assignDialog.id);

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Мастер назначен" });

      // Notify client
      await supabase.from("notifications").insert({
        user_id: assignDialog.client_id,
        title: "Мастер назначен",
        message: "К вашему заказу назначен мастер",
        type: "order_status",
        related_id: assignDialog.id,
      });

      loadData();
    }
    setAssignDialog(null);
    setSelectedMasterId("");
  };

  const approveMaster = async (userId: string) => {
    await supabase.from("profiles").update({ approval_status: "active" }).eq("user_id", userId);
    await supabase.from("notifications").insert({ user_id: userId, title: "Заявка одобрена!", message: "Ваша заявка мастера одобрена.", type: "approval" });
    toast({ title: "Мастер одобрен" }); loadData();
  };

  const rejectMaster = async (userId: string) => {
    await supabase.from("profiles").update({ approval_status: "rejected" }).eq("user_id", userId);
    await supabase.from("notifications").insert({ user_id: userId, title: "Заявка отклонена", message: "Ваша заявка мастера была отклонена.", type: "approval" });
    toast({ title: "Мастер отклонён" }); loadData();
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (categoryFilter !== "all" && o.category_id !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.address?.toLowerCase().includes(q) && !o.phone?.includes(q) && !o.services?.name_ru?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, categoryFilter, search]);

  const newOrders = orders.filter(o => o.status === "new");
  const activeOrders = orders.filter(o => !["completed", "cancelled", "reviewed"].includes(o.status));
  const completedOrds = orders.filter(o => o.status === "completed" || o.status === "reviewed");
  const revenue = completedOrds.reduce((s, o) => s + (o.budget || 0), 0);

  const clientUsers = allUsers.filter(u => u.user_roles?.some((r: any) => r.role === "client"));
  const masterUsers = allUsers.filter(u => u.user_roles?.some((r: any) => r.role === "master"));

  const navItems = [
    { path: "/dashboard", label: "Панель", icon: LayoutDashboard },
    { path: "/dashboard/orders", label: "Заказы", icon: ClipboardList, badge: newOrders.length },
    { path: "/dashboard/users", label: "Клиенты", icon: Users },
    { path: "/dashboard/masters", label: "Мастера", icon: Wrench },
    { path: "/dashboard/pending", label: "Заявки", icon: UserCheck, badge: pendingMasters.length },
    { path: "/dashboard/reviews", label: "Отзывы", icon: StarIcon },
  ];

  const stats = [
    { label: "Новых", value: newOrders.length, icon: ClipboardList, gradient: "from-blue-500/10 to-sky-500/10", iconColor: "text-blue-600", iconBg: "bg-blue-500/10" },
    { label: "Активных", value: activeOrders.length, icon: TrendingUp, gradient: "from-amber-500/10 to-yellow-500/10", iconColor: "text-amber-600", iconBg: "bg-amber-500/10" },
    { label: "Завершённых", value: completedOrds.length, icon: CheckCircle, gradient: "from-emerald-500/10 to-green-500/10", iconColor: "text-emerald-600", iconBg: "bg-emerald-500/10" },
    { label: "Клиентов", value: clientUsers.length, icon: Users, gradient: "from-violet-500/10 to-purple-500/10", iconColor: "text-violet-600", iconBg: "bg-violet-500/10" },
    { label: "Мастеров", value: masters.length, icon: Wrench, gradient: "from-orange-500/10 to-red-500/10", iconColor: "text-orange-600", iconBg: "bg-orange-500/10" },
    { label: "Заявки", value: pendingMasters.length, icon: UserCheck, gradient: "from-rose-500/10 to-pink-500/10", iconColor: "text-rose-600", iconBg: "bg-rose-500/10" },
  ];

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { key: "overview", label: "Обзор", icon: LayoutDashboard },
    { key: "orders", label: "Заказы", icon: ClipboardList, count: orders.length },
    { key: "pending", label: "Заявки", icon: UserCheck, count: pendingMasters.length },
    { key: "users", label: "Клиенты", icon: Users },
    { key: "masters", label: "Мастера", icon: Wrench },
    { key: "reviews", label: "Отзывы", icon: StarIcon },
  ];

  const getClientName = (clientId: string) => {
    const u = allUsers.find(u => u.user_id === clientId);
    return u?.full_name || "—";
  };

  return (
    <DashboardLayout title="Админ панель" navItems={navItems}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((s, i) => (
          <Card key={i} className={`bg-gradient-to-br ${s.gradient} border-0 shadow-sm`}>
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center mb-2`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
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
              {tb.count !== undefined && tb.count > 0 && (
                <Badge variant="secondary" className="h-4 min-w-[16px] px-1 text-[10px]">{tb.count}</Badge>
              )}
            </Button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : tab === "overview" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* New orders */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" /> Новые заказы
                {newOrders.length > 0 && <Badge className="bg-blue-100 text-blue-800 text-xs">{newOrders.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {newOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Нет новых заказов</p>
              ) : newOrders.slice(0, 5).map(o => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer" onClick={() => setDetailOrder(o)}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{o.services?.name_ru || o.service_categories?.name_ru || "Заказ"}</p>
                    <p className="text-xs text-muted-foreground">{o.address} • {new Date(o.created_at).toLocaleDateString("ru-RU")}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" className="h-7 text-xs rounded-full" onClick={e => { e.stopPropagation(); updateOrderStatus(o.id, "accepted"); }}>Принять</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Активные заказы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeOrders.slice(0, 5).map(o => (
                <div key={o.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted transition-colors" onClick={() => setDetailOrder(o)}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{o.services?.name_ru || "Заказ"}</p>
                    <p className="text-xs text-muted-foreground">{getClientName(o.client_id)}</p>
                  </div>
                  <Badge className={`${statusColors[o.status]} text-[10px] shrink-0`}>{statusLabels[o.status]}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending masters */}
          {pendingMasters.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-600" /> Заявки мастеров
                  <Badge className="bg-amber-100 text-amber-800 text-xs">{pendingMasters.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pendingMasters.slice(0, 4).map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20">
                      <div>
                        <p className="text-sm font-medium">{m.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{m.phone} • {m.experience_years || 0} лет</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setConfirmAction({ type: "approve", id: m.user_id, name: m.full_name }); }}>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setConfirmAction({ type: "reject", id: m.user_id, name: m.full_name }); }}>
                          <XCircle className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : tab === "orders" ? (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Поиск по адресу, телефону..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-10"><SelectValue placeholder="Статус" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 h-10"><SelectValue placeholder="Категория" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name_ru}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Orders table-like list */}
          <div className="space-y-2">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span className="col-span-3">Услуга</span>
              <span className="col-span-2">Клиент</span>
              <span className="col-span-2">Адрес</span>
              <span className="col-span-1">Дата</span>
              <span className="col-span-2">Статус</span>
              <span className="col-span-2">Действия</span>
            </div>

            {filteredOrders.map(order => (
              <Card key={order.id} className="hover:shadow-md transition-all">
                <CardContent className="p-3 md:p-4">
                  <div className="md:grid md:grid-cols-12 md:gap-3 md:items-center space-y-2 md:space-y-0">
                    <div className="col-span-3 min-w-0">
                      <p className="font-medium text-sm truncate">{order.services?.name_ru || order.service_categories?.name_ru || "Заказ"}</p>
                      <p className="text-[11px] text-muted-foreground">ID: {order.id.slice(0, 8)}</p>
                    </div>
                    <div className="col-span-2 min-w-0">
                      <p className="text-sm truncate">{getClientName(order.client_id)}</p>
                      <p className="text-[11px] text-muted-foreground">{order.phone}</p>
                    </div>
                    <div className="col-span-2 min-w-0">
                      <p className="text-sm truncate">{order.address}</p>
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("ru-RU")}</p>
                    </div>
                    <div className="col-span-2">
                      <Select value={order.status} onValueChange={v => updateOrderStatus(order.id, v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <Badge className={`${statusColors[order.status]} text-[10px]`}>{statusLabels[order.status]}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {statusFlow.map(s => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 flex gap-1.5">
                      <Button size="sm" variant="outline" className="h-7 text-xs rounded-full" onClick={() => setDetailOrder(order)}>
                        <Eye className="w-3 h-3 mr-1" /> Детали
                      </Button>
                      {!order.master_id && order.status !== "cancelled" && (
                        <Button size="sm" className="h-7 text-xs rounded-full" onClick={() => setAssignDialog(order)}>
                          Назначить
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : tab === "pending" ? (
        pendingMasters.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground"><UserCheck className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />Нет заявок на рассмотрении</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {pendingMasters.map(m => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{m.full_name || "—"}</p>
                      <p className="text-sm text-muted-foreground">{m.phone}</p>
                      {m.experience_years && <p className="text-sm text-muted-foreground">Опыт: {m.experience_years} лет</p>}
                      {m.service_categories?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">{m.service_categories.map((c: string) => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}</div>
                      )}
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
      ) : tab === "users" ? (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Поиск клиентов..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="space-y-2">
            {clientUsers.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search)).map(u => (
              <Card key={u.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{u.full_name || "—"}</p>
                      <p className="text-sm text-muted-foreground">{u.phone || "—"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("ru-RU")}</p>
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
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{m.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <StarIcon className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {m.average_rating}
                        <span>• {m.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">{m.service_categories?.slice(0, 2).map((c: string) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : tab === "reviews" ? (
        <div className="space-y-2">
          {reviews.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Нет отзывов</CardContent></Card>
          ) : reviews.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className={`w-4 h-4 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                {r.comment && <p className="text-sm text-foreground">{r.comment}</p>}
                <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString("ru-RU")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Order detail dialog */}
      <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Детали заказа</DialogTitle></DialogHeader>
          {detailOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Услуга:</span><p className="font-medium">{detailOrder.services?.name_ru || "—"}</p></div>
                <div><span className="text-muted-foreground">Категория:</span><p className="font-medium">{detailOrder.service_categories?.name_ru || "—"}</p></div>
                <div><span className="text-muted-foreground">Клиент:</span><p className="font-medium">{getClientName(detailOrder.client_id)}</p></div>
                <div><span className="text-muted-foreground">Телефон:</span><p className="font-medium">{detailOrder.phone}</p></div>
                <div><span className="text-muted-foreground">Адрес:</span><p className="font-medium">{detailOrder.address}</p></div>
                <div><span className="text-muted-foreground">Дата:</span><p className="font-medium">{new Date(detailOrder.created_at).toLocaleDateString("ru-RU")}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Описание:</span><p className="font-medium">{detailOrder.description || "—"}</p></div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Статус:</span>
                <Select value={detailOrder.status} onValueChange={v => { updateOrderStatus(detailOrder.id, v); setDetailOrder({ ...detailOrder, status: v }); }}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{statusFlow.map(s => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {!detailOrder.master_id && detailOrder.status !== "cancelled" && (
                <Button className="w-full rounded-full" onClick={() => { setAssignDialog(detailOrder); setDetailOrder(null); }}>
                  Назначить мастера
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign master dialog */}
      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Назначить мастера</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground mb-3">
            Заказ: {assignDialog?.services?.name_ru || assignDialog?.service_categories?.name_ru || "—"}
          </p>
          <Select value={selectedMasterId} onValueChange={setSelectedMasterId}>
            <SelectTrigger><SelectValue placeholder="Выберите мастера" /></SelectTrigger>
            <SelectContent>
              {masters.map(m => (
                <SelectItem key={m.id} value={m.user_id || m.id}>
                  {m.full_name} — ★{m.average_rating}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(null)} className="rounded-full">Отмена</Button>
            <Button onClick={assignMaster} disabled={!selectedMasterId} className="rounded-full">Назначить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.type === "approve" ? "Одобрить мастера?" : "Отклонить мастера?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "approve" ? `Мастер "${confirmAction?.name}" получит доступ.` : `Заявка "${confirmAction?.name}" будет отклонена.`}
            </AlertDialogDescription>
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
