import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft, Star, MapPin, Clock, Phone, MessageCircle,
  Users, Wrench, CheckCircle, Loader2,
} from "lucide-react";

interface Service {
  id: string;
  category_id: string;
  name_ru: string;
  name_tj: string;
  name_en: string;
  price_min: number;
  price_max: number;
  unit: string;
}

interface CategoryInfo {
  id: string;
  name_ru: string;
  name_tj: string;
  name_en: string;
  color: string;
}

interface MasterListing {
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
}

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [service, setService] = useState<Service | null>(null);
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [masters, setMasters] = useState<MasterListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState<MasterListing | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);
  const [bPhone, setBPhone] = useState("");
  const [bAddress, setBAddress] = useState("");
  const [bDistrict, setBDistrict] = useState("");
  const [bDesc, setBDesc] = useState("");

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      // Get service
      const { data: svcData } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!svcData) {
        setLoading(false);
        return;
      }
      setService(svcData as Service);

      // Get category
      const { data: catData } = await supabase
        .from("service_categories")
        .select("*")
        .eq("id", svcData.category_id)
        .maybeSingle();
      setCategory(catData as CategoryInfo | null);

      // Get masters matching this category
      const catName = catData?.name_ru || "";
      const { data: mastersData } = await supabase
        .from("master_listings")
        .select("*")
        .eq("is_active", true)
        .contains("service_categories", [catName])
        .order("average_rating", { ascending: false });

      setMasters((mastersData as unknown as MasterListing[]) || []);
      setLoading(false);
    };

    load();
  }, [id]);

  const getName = (item: { name_ru: string; name_tj: string; name_en: string }) => {
    if (language === "tj") return item.name_tj || item.name_ru;
    if (language === "en") return item.name_en || item.name_ru;
    return item.name_ru;
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Войдите в аккаунт", variant: "destructive" });
      navigate("/auth");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      client_id: user.id,
      service_id: service?.id || null,
      category_id: category?.id || null,
      description: `${service ? getName(service) : ""}${selectedMaster ? ` — Мастер: ${selectedMaster.full_name}` : ""}. ${bDesc}`,
      address: `${bDistrict ? bDistrict + ", " : ""}${bAddress}`,
      phone: bPhone,
      status: "new",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }
    setBookingDone(true);
    toast({ title: "Заказ создан!" });
    setTimeout(() => {
      setBookingOpen(false);
      setBookingDone(false);
      setSelectedMaster(null);
    }, 2000);
  };

  const openBooking = (master: MasterListing) => {
    setSelectedMaster(master);
    setBookingOpen(true);
    setBookingDone(false);
    setBPhone("");
    setBAddress("");
    setBDistrict("");
    setBDesc("");
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

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-muted-foreground">Услуга не найдена</p>
          <Button onClick={() => navigate("/categories")} variant="outline" className="mt-4 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> К категориям
          </Button>
        </div>
      </div>
    );
  }

  const gradients = [
    "from-primary to-emerald-400",
    "from-blue-500 to-cyan-400",
    "from-violet-500 to-purple-400",
    "from-amber-500 to-orange-400",
    "from-rose-500 to-pink-400",
    "from-teal-500 to-green-400",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-8 md:py-12">
        <div className="container px-4 mx-auto max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
            <Link to="/categories" className="hover:text-foreground transition-colors">Категории</Link>
            <span>/</span>
            {category && (
              <>
                <Link to={`/category/${category.id}`} className="hover:text-foreground transition-colors">
                  {getName(category)}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-foreground font-medium">{getName(service)}</span>
          </div>

          {/* Service header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${category?.color || "from-primary to-emerald-400"}`} />
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category?.color || "from-primary to-emerald-400"} flex items-center justify-center shrink-0`}>
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{getName(service)}</h1>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <Badge variant="secondary" className="text-sm">
                        {service.price_min}–{service.price_max} {language === "en" ? "som." : "сом."}/{service.unit}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="w-4 h-4" /> {masters.length} мастеров
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Masters list */}
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Мастера для «{getName(service)}»
          </h2>

          {masters.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Мастера для этой услуги пока не найдены</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {masters.map((master, index) => {
                const initials = master.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2);
                const gradient = gradients[index % gradients.length];

                return (
                  <motion.div
                    key={master.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                  >
                    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 overflow-hidden">
                      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                      <CardContent className="p-4 sm:p-5">
                        {/* Avatar + info */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md`}>
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link to={`/masters/${master.id}`} className="font-bold text-foreground hover:text-primary transition-colors truncate block">
                              {master.full_name}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold">{master.average_rating}</span>
                              <span className="text-xs text-muted-foreground">({master.total_reviews})</span>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {master.experience_years} лет опыта
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{master.working_districts.join(", ")}</span>
                          </div>
                        </div>

                        {/* Price + book */}
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <div>
                            <p className="text-xs text-muted-foreground">от</p>
                            <p className="text-base font-bold text-foreground">
                              {master.price_min} <span className="text-xs font-normal text-muted-foreground">сом.</span>
                            </p>
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full h-8 w-8 p-0"
                              onClick={() => window.open(`tel:${master.phone}`)}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              className="rounded-full h-8 px-3 text-xs"
                              onClick={() => openBooking(master)}
                            >
                              Заказать
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Booking dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-md max-h-[100dvh] sm:max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Заказать: {selectedMaster?.full_name}
            </DialogTitle>
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
