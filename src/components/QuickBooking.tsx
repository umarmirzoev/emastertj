import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Zap, Phone, MapPin, FileText, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickBookingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickBooking({ open, onOpenChange }: QuickBookingProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase
      .from("service_categories")
      .select("id, name_ru")
      .order("sort_order")
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Войдите в аккаунт", description: "Для создания заказа необходимо авторизоваться", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!description.trim() || !phone.trim() || !address.trim()) {
      toast({ title: "Заполните все поля", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("orders").insert({
      client_id: user.id,
      description: description.trim(),
      phone: phone.trim(),
      address: address.trim(),
      category_id: categoryId || null,
      status: "new",
      budget: 0,
    });

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
      // Notify admins
      const { data: admins } = await supabase.from("user_roles").select("user_id").in("role", ["admin", "super_admin"]);
      if (admins) {
        await Promise.all(
          admins.map((a) =>
            supabase.from("notifications").insert({
              user_id: a.user_id,
              title: "⚡ Срочный заказ",
              message: `Новый срочный заказ: ${description.slice(0, 60)}`,
              type: "urgent_order",
            })
          )
        );
      }

      toast({ title: "✅ Заказ создан!", description: "Мы найдём мастера в ближайшее время" });

      setTimeout(() => {
        setSuccess(false);
        setDescription("");
        setPhone("");
        setAddress("");
        setCategoryId("");
        onOpenChange(false);
      }, 2000);
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-amber-600" />
            </div>
            Срочный заказ
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="font-semibold text-foreground">Заказ отправлен!</p>
            <p className="text-sm text-muted-foreground">Мы подберём мастера и свяжемся с вами</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Опишите проблему — мы найдём подходящего мастера за считанные минуты.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Что случилось?</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Например: Потёк кран на кухне, нужен сантехник срочно"
                  className="min-h-[80px] rounded-xl"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Категория (необязательно)</label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Авто-определение" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name_ru}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Телефон</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+992 900 000 000"
                    className="pl-9 rounded-xl"
                    maxLength={20}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Адрес</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Улица, дом, квартира"
                    className="pl-9 rounded-xl"
                    maxLength={200}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !description.trim() || !phone.trim() || !address.trim()}
              className="w-full rounded-xl gap-2 h-11 bg-amber-500 hover:bg-amber-600 text-white"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {submitting ? "Отправка..." : "Отправить срочный заказ"}
            </Button>

            <p className="text-[11px] text-center text-muted-foreground">
              Среднее время ответа — 5 минут
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
