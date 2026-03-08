import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardList, DollarSign, Star, Clock, User, CheckCircle, XCircle,
  Play, MapPin, Phone, Calendar, Image, Briefcase, Bell, TrendingUp,
  Navigation, Eye, Loader2, Camera,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { useNotifications } from "@/hooks/useNotifications";

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
  new: "Новый", accepted: "Принят", assigned: "Назначен",
  on_the_way: "В пути", arrived: "Прибыл", in_progress: "В работе",
  completed: "Завершён", reviewed: "Оценён", cancelled: "Отменён",
};

type Tab = "overview" | "available" | "active" | "completed" | "earnings" | "profile" | "reviews" | "portfolio" | "notifications";

export default function MasterDashboard() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [detailOrder, setDetailOrder] = useState<any>(null);
  const { notifications, unreadCount } = useNotifications(user?.id);

  // Profile editing
  const [editBio, setEditBio] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editName, setEditName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    const [ordersRes, reviewsRes, portfolioRes] = await Promise.all([
      supabase.from("orders").select("*, service_categories(name_ru), services(name_ru)").eq("master_id", user.id).order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").eq("master_id", user.id).order("created_at", { ascending: false }),
      supabase.from("master_portfolio").select("*").eq("master_id", user.id).order("created_at", { ascending: false }),
    ]);
    setOrders(ordersRes.data || []);
    setReviews(reviewsRes.data || []);
    setPortfolio(portfolioRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);
  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || "");
      setEditPhone(profile.phone || "");
    }
  }, [profile]);

  useRealtimeOrders({ userId: user?.id, role: "master", onUpdate: fetchData });

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
      const statusMessages: Record<string, string> = {
        accepted: "Мастер принял ваш заказ",
        on_the_way: "Мастер выехал к вам",
        arrived: "Мастер прибыл на место",
        in_progress: "Мастер начал работу",
        completed: "Ваш заказ завершён",
      };
      if (statusMessages[status]) {
        await supabase.from("notifications").insert({
          user_id: order.client_id, title: "Обновление заказа",
          message: statusMessages[status], type: "order_status", related_id: orderId,
        });
      }
      fetchData();
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    await supabase.from("profiles").update({
      full_name: editName, phone: editPhone, bio: editBio,
    }).eq("user_id", user.id);
    setSavingProfile(false);
    toast({ title: "Профиль обновлён" });
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  const monthAgo = new Date(today.getTime() - 30 * 86400000);

  const completedOrders = orders.filter(o => ["completed", "reviewed"].includes(o.status));
  const activeOrders = orders.filter(o => ["assigned", "accepted", "on_the_way", "arrived", "in_progress"].includes(o.status));
  const newOrders = orders.filter(o => o.status === "new" || o.status === "assigned");
  const totalEarnings = completedOrders.reduce((s, o) => s + (o.budget || 0), 0);
  const todayEarnings = completedOrders.filter(o => new Date(o.completed_at || o.created_at) >= today).reduce((s, o) => s + (o.budget || 0), 0);
  const weekEarnings = completedOrders.filter(o => new Date(o.completed_at || o.created_at) >= weekAgo).reduce((s, o) => s + (o.budget || 0), 0);
  const monthEarnings = completedOrders.filter(o => new Date(o.completed_at || o.created_at) >= monthAgo).reduce((s, o) => s + (o.budget || 0), 0);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  const navItems = [
    { path: "/dashboard", label: "Обзор", icon: Briefcase },
    { path: "/dashboard/available", label: "Доступные", icon: ClipboardList, badge: newOrders.length },
    { path: "/dashboard/active", label: "Активные", icon: Clock, badge: activeOrders.length },
    { path: "/dashboard/completed", label: "Завершённые", icon: CheckCircle },
    { path: "/dashboard/earnings", label: "Доход", icon: DollarSign },
    { path: "/dashboard/reviews", label: "Отзывы", icon: Star },
    { path: "/dashboard/portfolio", label: "Портфолио", icon: Image },
    { path: "/dashboard/profile", label: "Профиль", icon: User },
    { path: "/dashboard/notifications", label: "Уведомления", icon: Bell, badge: unreadCount },
  ];

  const stats = [
    { label: "Доступные", value: newOrders.length, icon: ClipboardList, gradient: "from-blue-500/15 to-sky-500/15", iconColor: "text-blue-600", iconBg: "bg-blue-500/15" },
    { label: "Активные", value: activeOrders.length, icon: Clock, gradient: "from-amber-500/15 to-yellow-500/15", iconColor: "text-amber-600", iconBg: "bg-amber-500/15" },
    { label: "Завершённые", value: completedOrders.length, icon: CheckCircle, gradient: "from-emerald-500/15 to-green-500/15", iconColor: "text-emerald-600", iconBg: "bg-emerald-500/15" },
    { label: "Рейтинг", value: avgRating, icon: Star, gradient: "from-orange-500/15 to-amber-500/15", iconColor: "text-orange-600", iconBg: "bg-orange-500/15" },
    { label: "Отзывов", value: reviews.length, icon: Star, gradient: "from-pink-500/15 to-rose-500/15", iconColor: "text-pink-600", iconBg: "bg-pink-500/15" },
    { label: "Заработано", value: `${totalEarnings.toLocaleString()} с.`, icon: DollarSign, gradient: "from-violet-500/15 to-purple-500/15", iconColor: "text-violet-600", iconBg: "bg-violet-500/15" },
  ];

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { key: "overview", label: "Обзор", icon: Briefcase },
    { key: "available", label: "Доступные", icon: ClipboardList, count: newOrders.length },
    { key: "active", label: "Активные", icon: Clock, count: activeOrders.length },
    { key: "completed", label: "Завершённые", icon: CheckCircle, count: completedOrders.length },
    { key: "earnings", label: "Доход", icon: DollarSign },
    { key: "reviews", label: "Отзывы", icon: Star, count: reviews.length },
    { key: "portfolio", label: "Портфолио", icon: Image },
    { key: "profile", label: "Профиль", icon: User },
    { key: "notifications", label: "Уведомления", icon: Bell, count: unreadCount },
  ];

  const OrderCard = ({ order, showActions = true }: { order: any; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => setDetailOrder(order)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {order.services?.name_ru || order.service_categories?.name_ru || "Заказ"}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" /> <span className="truncate">{order.address}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <Phone className="w-3 h-3" /> {order.phone}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <Calendar className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString("ru-RU")}
            </div>
            {order.budget > 0 && (
              <p className="text-sm font-bold text-primary mt-1">{order.budget} сомонӣ</p>
            )}
          </div>
          <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
        </div>
        {order.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{order.description}</p>}
        {showActions && (
          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
            {(order.status === "new" || order.status === "assigned") && (
              <>
                <Button size="sm" onClick={() => updateStatus(order.id, "accepted", order)} className="rounded-full gap-1 text-xs">
                  <CheckCircle className="w-3 h-3" /> Принять
                </Button>
                <Button size="sm" variant="destructive" onClick={() => updateStatus(order.id, "cancelled", order)} className="rounded-full gap-1 text-xs">
                  <XCircle className="w-3 h-3" /> Отклонить
                </Button>
              </>
            )}
            {order.status === "accepted" && (
              <Button size="sm" onClick={() => updateStatus(order.id, "on_the_way", order)} className="rounded-full gap-1 text-xs">
                <Navigation className="w-3 h-3" /> В пути
              </Button>
            )}
            {order.status === "on_the_way" && (
              <Button size="sm" onClick={() => updateStatus(order.id, "arrived", order)} className="rounded-full gap-1 text-xs">
                <MapPin className="w-3 h-3" /> Прибыл
              </Button>
            )}
            {order.status === "arrived" && (
              <Button size="sm" onClick={() => updateStatus(order.id, "in_progress", order)} className="rounded-full gap-1 text-xs">
                <Play className="w-3 h-3" /> Начать
              </Button>
            )}
            {order.status === "in_progress" && (
              <Button size="sm" onClick={() => updateStatus(order.id, "completed", order)} className="rounded-full gap-1 text-xs">
                <CheckCircle className="w-3 h-3" /> Завершить
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Кабинет мастера" navItems={navItems}>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((s, i) => (
          <Card key={i} className={`bg-gradient-to-br ${s.gradient} border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]`}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-2`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
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
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : tab === "overview" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* New orders */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" /> Доступные заказы
                {newOrders.length > 0 && <Badge className="bg-blue-100 text-blue-800 text-xs">{newOrders.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {newOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Нет новых заказов</p>
              ) : newOrders.slice(0, 3).map(o => (
                <div key={o.id} className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer" onClick={() => setDetailOrder(o)}>
                  <p className="text-sm font-medium truncate">{o.services?.name_ru || o.service_categories?.name_ru || "Заказ"}</p>
                  <p className="text-xs text-muted-foreground">{o.address}</p>
                  {o.budget > 0 && <p className="text-xs font-bold text-primary mt-1">{o.budget} сомонӣ</p>}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active orders */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" /> Активные заказы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Нет активных заказов</p>
              ) : activeOrders.slice(0, 3).map(o => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors" onClick={() => setDetailOrder(o)}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{o.services?.name_ru || "Заказ"}</p>
                    <p className="text-xs text-muted-foreground">{o.address}</p>
                  </div>
                  <Badge className={`${statusColors[o.status]} text-[10px]`}>{statusLabels[o.status]}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Earnings summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Доход
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
                  <p className="text-lg font-bold text-emerald-600">{todayEarnings.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Сегодня</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 text-center">
                  <p className="text-lg font-bold text-blue-600">{weekEarnings.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Неделя</p>
                </div>
                <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 text-center">
                  <p className="text-lg font-bold text-violet-600">{monthEarnings.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Месяц</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent reviews */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> Последние отзывы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Нет отзывов</p>
              ) : reviews.slice(0, 3).map(r => (
                <div key={r.id} className="p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  {r.comment && <p className="text-xs text-foreground line-clamp-2">{r.comment}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString("ru-RU")}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : tab === "available" ? (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Доступные заказы</h2>
          {newOrders.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Нет доступных заказов</p></CardContent></Card>
          ) : newOrders.map(o => <OrderCard key={o.id} order={o} />)}
        </div>
      ) : tab === "active" ? (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Активные заказы</h2>
          {activeOrders.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Нет активных заказов</p></CardContent></Card>
          ) : activeOrders.map(o => <OrderCard key={o.id} order={o} />)}
        </div>
      ) : tab === "completed" ? (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Завершённые заказы</h2>
          {completedOrders.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Нет завершённых заказов</p></CardContent></Card>
          ) : completedOrders.map(o => <OrderCard key={o.id} order={o} showActions={false} />)}
        </div>
      ) : tab === "earnings" ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Мой доход</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">
              <CardContent className="p-5">
                <p className="text-2xl font-bold">{todayEarnings.toLocaleString()} <span className="text-sm opacity-80">сом.</span></p>
                <p className="text-sm opacity-80">Сегодня</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-5">
                <p className="text-2xl font-bold">{weekEarnings.toLocaleString()} <span className="text-sm opacity-80">сом.</span></p>
                <p className="text-sm opacity-80">Неделя</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <CardContent className="p-5">
                <p className="text-2xl font-bold">{monthEarnings.toLocaleString()} <span className="text-sm opacity-80">сом.</span></p>
                <p className="text-sm opacity-80">Месяц</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <CardContent className="p-5">
                <p className="text-2xl font-bold">{totalEarnings.toLocaleString()} <span className="text-sm opacity-80">сом.</span></p>
                <p className="text-sm opacity-80">Всего</p>
              </CardContent>
            </Card>
          </div>
          {/* Completed orders with earnings */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">История заработка</CardTitle></CardHeader>
            <CardContent>
              {completedOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Нет завершённых заказов</p>
              ) : (
                <div className="space-y-2">
                  {completedOrders.slice(0, 20).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{o.services?.name_ru || "Заказ"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(o.completed_at || o.created_at).toLocaleDateString("ru-RU")}</p>
                      </div>
                      <span className="font-bold text-emerald-600 text-sm">+{o.budget || 0} сом.</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : tab === "reviews" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Отзывы клиентов</h2>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{avgRating}</span>
              <span className="text-muted-foreground">({reviews.length} отзывов)</span>
            </div>
          </div>
          {reviews.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Нет отзывов</p></CardContent></Card>
          ) : reviews.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">{new Date(r.created_at).toLocaleDateString("ru-RU")}</span>
                </div>
                {r.comment && <p className="text-sm text-foreground">{r.comment}</p>}
                {r.photos && r.photos.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {r.photos.map((p: string, i: number) => (
                      <img key={i} src={p} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tab === "portfolio" ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Мои работы</h2>
          {portfolio.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Портфолио пусто</p><p className="text-xs text-muted-foreground mt-1">Загрузите фото ваших работ</p></CardContent></Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {portfolio.map(p => (
                <Card key={p.id} className="overflow-hidden group">
                  <div className="aspect-square bg-muted relative">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div>
                        <p className="text-white text-sm font-medium">{p.title}</p>
                        {p.category && <p className="text-white/70 text-xs">{p.category}</p>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : tab === "profile" ? (
        <Card>
          <CardHeader><CardTitle className="text-lg">Профиль мастера</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {(profile?.full_name || "М").split(" ").map(w => w[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">{profile?.full_name || "Мастер"}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {avgRating}
                  <span>•</span>
                  <span>{completedOrders.length} заказов</span>
                  <span>•</span>
                  <span>{totalEarnings.toLocaleString()} сом.</span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Имя</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Телефон</label>
              <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">О себе</label>
              <Textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} placeholder="Расскажите о вашем опыте..." />
            </div>
            <Button onClick={saveProfile} disabled={savingProfile} className="rounded-full">
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Сохранить
            </Button>
          </CardContent>
        </Card>
      ) : tab === "notifications" ? (
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground mb-2">Уведомления</h2>
          {notifications.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Нет уведомлений</p></CardContent></Card>
          ) : notifications.map(n => (
            <Card key={n.id} className={!n.read ? "border-primary/30 bg-primary/5" : ""}>
              <CardContent className="p-4">
                <p className="font-medium text-sm text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(n.created_at).toLocaleString("ru-RU")}</p>
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
                <div><span className="text-muted-foreground">Телефон:</span><p className="font-medium">{detailOrder.phone}</p></div>
                <div><span className="text-muted-foreground">Дата:</span><p className="font-medium">{new Date(detailOrder.created_at).toLocaleDateString("ru-RU")}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Адрес:</span><p className="font-medium">{detailOrder.address}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Описание:</span><p className="font-medium">{detailOrder.description || "—"}</p></div>
                {detailOrder.budget > 0 && (
                  <div><span className="text-muted-foreground">Бюджет:</span><p className="font-bold text-primary">{detailOrder.budget} сомонӣ</p></div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(detailOrder.status === "new" || detailOrder.status === "assigned") && (
                  <Button onClick={() => { updateStatus(detailOrder.id, "accepted", detailOrder); setDetailOrder(null); }} className="rounded-full gap-1">
                    <CheckCircle className="w-4 h-4" /> Принять
                  </Button>
                )}
                {detailOrder.status === "accepted" && (
                  <Button onClick={() => { updateStatus(detailOrder.id, "on_the_way", detailOrder); setDetailOrder(null); }} className="rounded-full gap-1">
                    <Navigation className="w-4 h-4" /> Выехать
                  </Button>
                )}
                {detailOrder.status === "on_the_way" && (
                  <Button onClick={() => { updateStatus(detailOrder.id, "arrived", detailOrder); setDetailOrder(null); }} className="rounded-full gap-1">
                    <MapPin className="w-4 h-4" /> Прибыл
                  </Button>
                )}
                {detailOrder.status === "arrived" && (
                  <Button onClick={() => { updateStatus(detailOrder.id, "in_progress", detailOrder); setDetailOrder(null); }} className="rounded-full gap-1">
                    <Play className="w-4 h-4" /> Начать
                  </Button>
                )}
                {detailOrder.status === "in_progress" && (
                  <Button onClick={() => { updateStatus(detailOrder.id, "completed", detailOrder); setDetailOrder(null); }} className="rounded-full gap-1">
                    <CheckCircle className="w-4 h-4" /> Завершить
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
