import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutDashboard, ClipboardList, Users, UserCheck, Wrench, Star as StarIcon,
  Shield, Settings, BarChart3, FolderTree, Search, DollarSign,
  CheckCircle, XCircle, Eye, Trash2, MoreVertical, TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800", accepted: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-purple-100 text-purple-800", completed: "bg-green-100 text-green-800",
  reviewed: "bg-violet-100 text-violet-800", cancelled: "bg-red-100 text-red-800",
};
const statusLabels: Record<string, string> = {
  new: "Новый", accepted: "Принят", in_progress: "В работе",
  completed: "Завершён", reviewed: "Оценён", cancelled: "Отменён",
};

type Tab = "overview" | "orders" | "pending" | "users" | "services" | "reviews" | "admins" | "categories" | "settings";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pendingMasters, setPendingMasters] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string; name: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [ordersRes, usersRes, catsRes, pendingRes, reviewsRes] = await Promise.all([
      supabase.from("orders").select("*, service_categories(name_ru), services(name_ru)").order("created_at", { ascending: false }).limit(100),
      supabase.from("profiles").select("*, user_roles(role)").limit(200),
      supabase.from("service_categories").select("*, services(count)").order("sort_order"),
      supabase.from("profiles").select("*").eq("approval_status", "pending"),
      supabase.from("reviews").select("*, orders(service_categories(name_ru))").order("created_at", { ascending: false }).limit(50),
    ]);
    setOrders(ordersRes.data || []);
    setUsers(usersRes.data || []);
    setCategories(catsRes.data || []);
    setPendingMasters(pendingRes.data || []);
    setReviews(reviewsRes.data || []);
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
    else { setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o)); toast({ title: "Статус обновлён" }); }
  };

  const approveMaster = async (userId: string) => {
    await supabase.from("profiles").update({ approval_status: "active" }).eq("user_id", userId);
    await supabase.from("notifications").insert({ user_id: userId, title: "Заявка одобрена!", message: "Ваша заявка мастера одобрена. Теперь вы можете получать заказы.", type: "approval" });
    toast({ title: "Мастер одобрен" }); loadData();
  };

  const rejectMaster = async (userId: string) => {
    await supabase.from("profiles").update({ approval_status: "rejected" }).eq("user_id", userId);
    await supabase.from("notifications").insert({ user_id: userId, title: "Заявка отклонена", message: "К сожалению, ваша заявка мастера была отклонена.", type: "approval" });
    toast({ title: "Мастер отклонён" }); loadData();
  };

  const navItems = [
    { path: "/dashboard", label: "Панель управления", icon: LayoutDashboard },
    { path: "/dashboard/users", label: "Пользователи", icon: Users },
    { path: "/dashboard/services", label: "Услуги", icon: Wrench },
    { path: "/dashboard/settings", label: "Настройки", icon: Settings },
  ];

  const completedOrders = orders.filter(o => o.status === "completed" || o.status === "reviewed");
  const revenue = completedOrders.reduce((s, o) => s + (o.budget || 0), 0);
  const admins = users.filter(u => u.user_roles?.some((r: any) => r.role === "admin" || r.role === "super_admin"));

  const stats = [
    { label: "Заказов", value: orders.length, icon: ClipboardList, gradient: "from-blue-500/15 to-sky-500/15", iconColor: "text-blue-600", iconBg: "bg-blue-500/15" },
    { label: "Пользователей", value: users.length, icon: Users, gradient: "from-violet-500/15 to-purple-500/15", iconColor: "text-violet-600", iconBg: "bg-violet-500/15" },
    { label: "Ожидают", value: pendingMasters.length, icon: UserCheck, gradient: "from-amber-500/15 to-yellow-500/15", iconColor: "text-amber-600", iconBg: "bg-amber-500/15" },
    { label: "Выручка", value: `${revenue} сом.`, icon: DollarSign, gradient: "from-emerald-500/15 to-green-500/15", iconColor: "text-emerald-600", iconBg: "bg-emerald-500/15" },
    { label: "Отзывов", value: reviews.length, icon: StarIcon, gradient: "from-orange-500/15 to-red-500/15", iconColor: "text-orange-600", iconBg: "bg-orange-500/15" },
    { label: "Админов", value: admins.length, icon: Shield, gradient: "from-rose-500/15 to-pink-500/15", iconColor: "text-rose-600", iconBg: "bg-rose-500/15" },
  ];

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "overview", label: "Обзор", icon: LayoutDashboard },
    { key: "orders", label: "Заказы", icon: ClipboardList },
    { key: "pending", label: `Заявки (${pendingMasters.length})`, icon: UserCheck },
    { key: "users", label: "Пользователи", icon: Users },
    { key: "services", label: "Услуги", icon: Wrench },
    { key: "reviews", label: "Отзывы", icon: StarIcon },
    { key: "admins", label: "Админы", icon: Shield },
    { key: "categories", label: "Категории", icon: FolderTree },
  ];

  return (
    <DashboardLayout title="Суперадмин" navItems={navItems}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((s, i) => (
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

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 border-b border-border pb-2 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <Button key={t.key} variant={tab === t.key ? "default" : "ghost"} size="sm" onClick={() => setTab(t.key)} className="rounded-full whitespace-nowrap gap-1.5 shrink-0">
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </Button>
          );
        })}
      </div>

      {/* Search */}
      {tab !== "overview" && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : tab === "overview" ? (
        /* Overview */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Последние заказы</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{o.services?.name_ru || o.service_categories?.name_ru || "Заказ"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("ru-RU")}</p>
                  </div>
                  <Badge className={`${statusColors[o.status]} text-xs shrink-0 ml-2`}>{statusLabels[o.status]}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><UserCheck className="w-4 h-4 text-amber-600" /> Ожидающие заявки</CardTitle></CardHeader>
            <CardContent>
              {pendingMasters.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Нет заявок</p>
              ) : (
                <div className="space-y-2">
                  {pendingMasters.slice(0, 5).map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                      <div><p className="text-sm font-medium">{m.full_name || "—"}</p><p className="text-xs text-muted-foreground">{m.phone}</p></div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => approveMaster(m.user_id)}><CheckCircle className="w-4 h-4 text-green-600" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => rejectMaster(m.user_id)}><XCircle className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : tab === "pending" ? (
        pendingMasters.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Нет заявок на рассмотрении</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {pendingMasters.map((m) => (
              <Card key={m.id} className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{m.full_name || "—"}</p>
                      <p className="text-sm text-muted-foreground">{m.phone || "—"}</p>
                      {m.experience_years && <p className="text-sm text-muted-foreground">Опыт: {m.experience_years} лет</p>}
                      {m.service_categories?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">{m.service_categories.map((cat: string) => <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>)}</div>
                      )}
                      {m.working_districts?.length > 0 && <p className="text-xs text-muted-foreground mt-1">Районы: {m.working_districts.join(", ")}</p>}
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
      ) : tab === "orders" ? (
        <div className="space-y-3">
          {orders.filter((o) => !search || o.address?.toLowerCase().includes(search.toLowerCase()) || o.phone?.includes(search)).map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{order.services?.name_ru || order.service_categories?.name_ru || "Заказ"}</p>
                  <p className="text-sm text-muted-foreground">{order.address} • {order.phone}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("ru-RU")}</p>
                </div>
                <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tab === "users" ? (
        <div className="space-y-3">
          {users.filter((u) => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search)).map((u) => (
            <Card key={u.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div><p className="font-medium text-foreground">{u.full_name || "—"}</p><p className="text-sm text-muted-foreground">{u.phone || "—"}</p></div>
                </div>
                <div className="flex gap-1">{u.user_roles?.map((r: any, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">{r.role === "super_admin" ? "Суперадмин" : r.role === "admin" ? "Админ" : r.role === "master" ? "Мастер" : "Клиент"}</Badge>
                ))}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tab === "admins" ? (
        <div className="space-y-3">
          {admins.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Нет администраторов</CardContent></Card>
          ) : admins.map((a) => (
            <Card key={a.id} className="hover:shadow-md transition-all">
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
                <div className="flex items-center gap-2">
                  {a.user_roles?.map((r: any, i: number) => (
                    <Badge key={i} className={r.role === "super_admin" ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"}>
                      {r.role === "super_admin" ? "Суперадмин" : "Админ"}
                    </Badge>
                  ))}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> Просмотр</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tab === "reviews" ? (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Нет отзывов</CardContent></Card>
          ) : reviews.map((r) => (
            <Card key={r.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className={`w-4 h-4 ${i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    {r.comment && <p className="text-sm text-foreground">{r.comment}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString("ru-RU")}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Удалить</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tab === "categories" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md`}>
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{cat.name_ru}</p>
                  <p className="text-sm text-muted-foreground">{cat.services?.[0]?.count || 0} услуг</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> Редактировать</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                <div><p className="font-medium text-foreground">{cat.name_ru}</p><p className="text-sm text-muted-foreground">{cat.services?.[0]?.count || 0} услуг</p></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.type === "approve" ? "Одобрить мастера?" : "Отклонить мастера?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "approve" ? `Мастер "${confirmAction?.name}" получит доступ к заказам.` : `Заявка мастера "${confirmAction?.name}" будет отклонена.`}
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
