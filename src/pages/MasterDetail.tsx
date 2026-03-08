import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Star, MapPin, Clock, Phone, MessageCircle,
  ArrowLeft, CheckCircle, Shield, Award, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

interface MasterData {
  id: string;
  full_name: string;
  phone: string;
  bio: string;
  service_categories: string[];
  working_districts: string[];
  experience_years: number;
  average_rating: number;
  total_reviews: number;
  price_min: number;
  price_max: number;
  latitude: number | null;
  longitude: number | null;
}

export default function MasterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [master, setMaster] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);

  // Booking form
  const [bPhone, setBPhone] = useState("");
  const [bAddress, setBAddress] = useState("");
  const [bDistrict, setBDistrict] = useState("");
  const [bDesc, setBDesc] = useState("");
  const [bTime, setBTime] = useState("");

  useEffect(() => {
    if (!id) return;
    supabase
      .from("master_listings")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setMaster(data as unknown as MasterData | null);
        setLoading(false);
      });
  }, [id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Войдите в аккаунт", description: "Для заказа нужна авторизация", variant: "destructive" });
      navigate("/auth");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      client_id: user.id,
      description: `Мастер: ${master?.full_name}. ${bDesc}`,
      address: `${bDistrict ? bDistrict + ", " : ""}${bAddress}`,
      phone: bPhone,
      preferred_time: bTime || null,
      status: "new",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }
    setBookingDone(true);
    toast({ title: "Заказ создан!" });
    setTimeout(() => { setBookingOpen(false); setBookingDone(false); }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!master) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground text-lg">Мастер не найден</p>
          <Button onClick={() => navigate("/masters")} variant="outline" className="mt-4 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> К списку мастеров
          </Button>
        </div>
      </div>
    );
  }

  const initials = master.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
        {/* Back button */}
        <Button variant="ghost" className="mb-4 rounded-full" onClick={() => navigate("/masters")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад к мастерам
        </Button>

        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden mb-6">
            <div className="h-3 bg-gradient-to-r from-primary to-emerald-400" />
            <CardContent className="p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white text-2xl font-bold shadow-xl shrink-0">
                  {initials}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{master.full_name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`w-5 h-5 ${i <= Math.round(master.average_rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <span className="text-lg font-semibold">{master.average_rating}</span>
                    <span className="text-muted-foreground">({master.total_reviews} отзывов)</span>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {master.experience_years} лет опыта
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-primary" /> Проверенный
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500" /> Гарантия
                    </span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mt-5">
                {master.service_categories.map((cat) => (
                  <Badge key={cat} className="text-sm px-3 py-1">{cat}</Badge>
                ))}
              </div>

              {/* Districts */}
              <div className="flex items-center gap-1.5 mt-4 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {master.working_districts.join(", ")}
              </div>

              {/* Bio */}
              {master.bio && (
                <p className="mt-4 text-muted-foreground leading-relaxed">{master.bio}</p>
              )}

              {/* Price */}
              <div className="mt-5 p-4 rounded-xl bg-muted/50 border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Стоимость услуг</p>
                <p className="text-2xl font-bold text-foreground">
                  {master.price_min} – {master.price_max} <span className="text-base font-normal text-muted-foreground">сом.</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  size="lg"
                  className="flex-1 rounded-full h-12 text-base font-semibold shadow-lg bg-gradient-to-r from-primary to-emerald-500"
                  onClick={() => setBookingOpen(true)}
                >
                  Заказать мастера
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-12 gap-2" asChild>
                  <a href={`tel:${master.phone}`}>
                    <Phone className="w-4 h-4" /> Позвонить
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-12 gap-2" asChild>
                  <a href={`https://wa.me/${master.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Map placeholder */}
        {master.latitude && master.longitude && (
          <Card className="mb-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <iframe
                  title="Местоположение мастера"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${master.longitude - 0.02},${master.latitude - 0.015},${master.longitude + 0.02},${master.latitude + 0.015}&layer=mapnik&marker=${master.latitude},${master.longitude}`}
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Примерное местоположение мастера в Душанбе
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-md max-h-[100dvh] sm:max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Заказать мастера: {master.full_name}</DialogTitle>
          </DialogHeader>
          {bookingDone ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="font-medium text-foreground">Заказ успешно создан!</p>
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-4">
              <Input placeholder="Ваш телефон" value={bPhone} onChange={(e) => setBPhone(e.target.value)} required type="tel" className="h-12 text-base" />
              <Select value={bDistrict} onValueChange={setBDistrict}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Район" />
                </SelectTrigger>
                <SelectContent>
                  {["Сино", "Фирдавси", "Шохмансур", "Исмоили Сомони", "Пригород"].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Адрес" value={bAddress} onChange={(e) => setBAddress(e.target.value)} required className="h-12 text-base" />
              <Input placeholder="Удобное время" value={bTime} onChange={(e) => setBTime(e.target.value)} className="h-12 text-base" />
              <Textarea placeholder="Опишите проблему..." value={bDesc} onChange={(e) => setBDesc(e.target.value)} className="text-base min-h-[80px]" />
              <Button type="submit" className="w-full rounded-full h-12 text-base" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Отправить заказ
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
