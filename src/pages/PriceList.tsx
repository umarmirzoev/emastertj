import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import OrderModal from "@/components/OrderModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, ArrowRight, Wrench } from "lucide-react";
import { motion } from "framer-motion";

interface ServiceCategory {
  id: string;
  name_ru: string;
  name_tj: string;
  name_en: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface Service {
  id: string;
  category_id: string;
  name_ru: string;
  name_tj: string;
  name_en: string;
  price_min: number;
  price_avg: number;
  price_max: number;
  unit: string;
  note: string | null;
  sort_order: number;
}

export default function PriceList() {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [orderModal, setOrderModal] = useState<{ open: boolean; categoryId?: string; serviceId?: string; name?: string }>({ open: false });

  useEffect(() => {
    Promise.all([
      supabase.from("service_categories").select("*").order("sort_order"),
      supabase.from("services").select("*").order("sort_order"),
    ]).then(([catsRes, servicesRes]) => {
      setCategories(catsRes.data || []);
      setServices(servicesRes.data || []);
      setLoading(false);
    });
  }, []);

  const getName = (item: { name_ru: string; name_tj: string; name_en: string }) => {
    if (language === "tj") return item.name_tj || item.name_ru;
    if (language === "en") return item.name_en || item.name_ru;
    return item.name_ru;
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return services.filter(
      (s) => s.name_ru.toLowerCase().includes(q) || s.name_en.toLowerCase().includes(q) || s.name_tj.toLowerCase().includes(q)
    );
  }, [search, services]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of services) {
      if (!map.has(s.category_id)) map.set(s.category_id, []);
      map.get(s.category_id)!.push(s);
    }
    return map;
  }, [services]);

  const priceLabel = language === "en" ? "som." : "сом.";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-12 md:py-20">
        <div className="container px-4 mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{t("servicesTitle")}</h1>
            <p className="text-muted-foreground">{t("servicesSubtitle")}</p>
          </motion.div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={language === "en" ? "Search services..." : "Поиск услуг..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : filtered ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                {filtered.length} {language === "en" ? "results" : "результатов"}
              </p>
              {filtered.map((s) => (
                <ServiceRow
                  key={s.id}
                  service={s}
                  getName={getName}
                  priceLabel={priceLabel}
                  onOrder={() => setOrderModal({ open: true, categoryId: s.category_id, serviceId: s.id, name: getName(s) })}
                />
              ))}
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {categories.map((cat) => {
                const catServices = groupedByCategory.get(cat.id) || [];
                return (
                  <AccordionItem key={cat.id} value={cat.id} className="border rounded-xl px-4 overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                          <Wrench className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">{getName(cat)}</p>
                          <p className="text-xs text-muted-foreground">{catServices.length} {language === "en" ? "services" : "услуг"}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pb-2">
                        {catServices.map((s) => (
                          <ServiceRow
                            key={s.id}
                            service={s}
                            getName={getName}
                            priceLabel={priceLabel}
                            onOrder={() => setOrderModal({ open: true, categoryId: cat.id, serviceId: s.id, name: getName(s) })}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      </section>
      <Footer />
      <OrderModal
        isOpen={orderModal.open}
        onClose={() => setOrderModal({ open: false })}
        category={null}
        categoryId={orderModal.categoryId}
        serviceId={orderModal.serviceId}
        initialServiceName={orderModal.name}
      />
    </div>
  );
}

function ServiceRow({ service, getName, priceLabel, onOrder }: {
  service: Service;
  getName: (s: { name_ru: string; name_tj: string; name_en: string }) => string;
  priceLabel: string;
  onOrder: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{getName(service)}</p>
        {service.note && <p className="text-xs text-muted-foreground">{service.note}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Badge variant="secondary" className="text-xs whitespace-nowrap">
          {service.price_min}–{service.price_max} {priceLabel}
        </Badge>
        <span className="text-xs text-muted-foreground hidden sm:block">/{service.unit}</span>
        <Button size="sm" variant="ghost" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={onOrder}>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
