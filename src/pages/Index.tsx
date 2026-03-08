import { useState, useEffect } from "react";
import QuickBooking from "@/components/QuickBooking";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Services } from "@/components/Services";
import OrderModal from "@/components/OrderModal";
import {
  Clock, Shield, Star, CheckCircle,
  Phone, Siren, Search, FileText, Truck, ArrowRight, Users, MapPin, Quote,
} from "lucide-react";

interface PopularMaster {
  id: string;
  full_name: string;
  average_rating: number;
  total_reviews: number;
  experience_years: number;
  service_categories: string[];
  working_districts: string[];
  price_min: number;
}

interface SearchResult {
  type: "category" | "service";
  id: string;
  name: string;
  parentName?: string;
  parentId?: string;
}

const Index = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedServiceName, setSelectedServiceName] = useState("");
  const [quickBookOpen, setQuickBookOpen] = useState(false);

  // Popular masters
  const [popularMasters, setPopularMasters] = useState<PopularMaster[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);

  useEffect(() => {
    // Load popular masters
    supabase
      .from("master_listings")
      .select("id, full_name, average_rating, total_reviews, experience_years, service_categories, working_districts, price_min")
      .eq("is_active", true)
      .order("average_rating", { ascending: false })
      .limit(6)
      .then(({ data }) => setPopularMasters((data as PopularMaster[]) || []));

    // Load categories and services for search
    Promise.all([
      supabase.from("service_categories").select("id, name_ru, name_tj, name_en"),
      supabase.from("services").select("id, name_ru, name_tj, name_en, category_id"),
    ]).then(([catRes, svcRes]) => {
      setAllCategories(catRes.data || []);
      setAllServices(svcRes.data || []);
    });
  }, []);

  // Smart search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search categories
    for (const cat of allCategories) {
      const name = language === "tj" ? cat.name_tj : language === "en" ? cat.name_en : cat.name_ru;
      if (name.toLowerCase().includes(q)) {
        results.push({ type: "category", id: cat.id, name });
      }
    }

    // Search services
    for (const svc of allServices) {
      const name = language === "tj" ? svc.name_tj : language === "en" ? svc.name_en : svc.name_ru;
      if (name.toLowerCase().includes(q)) {
        const cat = allCategories.find((c: any) => c.id === svc.category_id);
        const catName = cat ? (language === "tj" ? cat.name_tj : language === "en" ? cat.name_en : cat.name_ru) : "";
        results.push({ type: "service", id: svc.id, name, parentName: catName, parentId: cat?.id });
      }
    }

    // Keyword mapping for common problems
    const keywordMap: Record<string, string[]> = {
      "течет": ["Сантехника"],
      "кран": ["Сантехника"],
      "труб": ["Сантехника"],
      "унитаз": ["Сантехника"],
      "розетк": ["Электрика"],
      "свет": ["Электрика"],
      "провод": ["Электрика"],
      "мебел": ["Мебель и двери"],
      "шкаф": ["Мебель и двери"],
      "дверь": ["Мебель и двери"],
      "стирал": ["Ремонт техники"],
      "холодил": ["Ремонт техники"],
      "кондиционер": ["Кондиционеры"],
      "отоплен": ["Отопление"],
      "убор": ["Уборка"],
      "камер": ["Видеонаблюдение"],
      "сварк": ["Сварочные работы"],
    };

    if (results.length === 0) {
      for (const [keyword, catNames] of Object.entries(keywordMap)) {
        if (q.includes(keyword)) {
          for (const catName of catNames) {
            const cat = allCategories.find((c: any) => c.name_ru === catName);
            if (cat) {
              const name = language === "tj" ? cat.name_tj : language === "en" ? cat.name_en : cat.name_ru;
              results.push({ type: "category", id: cat.id, name: `${name} — подходящая категория` });
              // Also find matching services
              const matchingSvcs = allServices.filter((s: any) => s.category_id === cat.id).slice(0, 3);
              for (const svc of matchingSvcs) {
                const svcName = language === "tj" ? svc.name_tj : language === "en" ? svc.name_en : svc.name_ru;
                results.push({ type: "service", id: svc.id, name: svcName, parentName: name, parentId: cat.id });
              }
            }
          }
        }
      }
    }

    setSearchResults(results.slice(0, 8));
    setShowSearchResults(results.length > 0);
  }, [searchQuery, allCategories, allServices, language]);

  const handleSearchSelect = (result: SearchResult) => {
    setShowSearchResults(false);
    setSearchQuery("");
    if (result.type === "category") {
      navigate(`/category/${result.id}`);
    } else {
      navigate(`/service/${result.id}`);
    }
  };

  const handleQuickOrder = () => {
    setSelectedCategory("other");
    setSelectedServiceName("");
    setIsOrderModalOpen(true);
  };

  const steps = [
    { icon: Search, titleKey: "howItWorksStep1Title", descKey: "howItWorksStep1Desc" },
    { icon: FileText, titleKey: "howItWorksStep2Title", descKey: "howItWorksStep2Desc" },
    { icon: Truck, titleKey: "howItWorksStep3Title", descKey: "howItWorksStep3Desc" },
  ];

  const testimonials = [
    { name: "Мадина Раҳимова", text: "Усто дар 40 дақиқа расид ва дар як соат ҳамаашро таъмир кард. Нарх — 150 сомонӣ, бе ягон доплата. Хеле мамнунам!", rating: 5 },
    { name: "Фирдавс Каримов", text: "Барқкор мушкилиро пайдо кард, ки дигарон наметавонистанд. 3 розетка насб кард — ҳар кадом 30 сомонӣ. Тавсия медиҳам!", rating: 5 },
    { name: "Нигора Саидова", text: "Тозакунии хонаро фармоиш додам — ҳама чиз медурахшад! 15 сомонӣ/м². Боз истифода мебарам.", rating: 5 },
  ];

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

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative pt-10 pb-16 md:pt-20 md:pb-28 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container px-4 mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 tracking-tight leading-[1.1]">
              {t("heroTitle")}
            </h1>
            <p className="text-lg md:text-xl font-medium text-primary mb-3">{t("heroSubtitle")}</p>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">{t("heroDescription")}</p>
          </motion.div>

          {/* Search bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-2xl mx-auto mb-10 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                placeholder={language === "en" ? "Describe your problem: leaky faucet, broken outlet..." : language === "tj" ? "Мушкилиро тавсиф кунед: кран мечакад, розетка кор намекунад..." : "Опишите проблему: течёт кран, не работает розетка, нужна уборка..."}
                className="h-14 pl-12 pr-4 text-base rounded-2xl border-2 border-border focus:border-primary shadow-lg"
              />
            </div>
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                {searchResults.map((r, i) => (
                  <button
                    key={`${r.type}-${r.id}-${i}`}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3 border-b border-border/50 last:border-0"
                    onMouseDown={() => handleSearchSelect(r)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.type === "category" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {r.type === "category" ? <Users className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      {r.parentName && <p className="text-xs text-muted-foreground">{r.parentName}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* CTA buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto mb-12">
            <Button onClick={handleQuickOrder} size="lg" className="flex-1 rounded-full px-8 py-6 text-base font-semibold shadow-xl hover:shadow-2xl transition-all bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90">
              <Phone className="w-5 h-5 mr-2" />
              {t("heroOrderButton")}
            </Button>
            <Button onClick={() => setQuickBookOpen(true)} variant="outline" size="lg" className="flex-1 border-2 border-destructive/30 text-destructive rounded-full px-6 py-6 text-base font-semibold group">
              <Siren className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              <span className="flex flex-col items-start sm:items-center">
                <span>{t("heroEmergencyButton")}</span>
                <span className="text-xs opacity-70">{t("heroEmergencySubtext")}</span>
              </span>
            </Button>
          </motion.div>

          {/* Trust stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 max-w-2xl mx-auto">
            {[
              { icon: Clock, value: t("trustTime"), desc: t("trustTimeDesc"), gradient: "from-primary/20 to-emerald-400/20", iconBg: "bg-primary/15", iconColor: "text-primary" },
              { icon: Star, value: t("trustRating"), desc: t("trustRatingDesc"), gradient: "from-yellow-400/20 to-amber-400/20", iconBg: "bg-yellow-500/15", iconColor: "text-yellow-600" },
              { icon: CheckCircle, value: t("trustOrders"), desc: t("trustOrdersDesc"), gradient: "from-blue-400/20 to-sky-400/20", iconBg: "bg-blue-500/15", iconColor: "text-blue-600" },
            ].map((stat, i) => (
              <div key={i} className={`relative p-5 rounded-2xl bg-gradient-to-br ${stat.gradient} border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm`}>
                <div className="flex items-center gap-4 sm:flex-col sm:text-center">
                  <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Categories */}
      <section className="py-12 bg-muted/50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{t("categoriesTitle")}</h2>
            <p className="text-muted-foreground">{t("categoriesDescription")}</p>
            <Link to="/categories" className="inline-flex items-center mt-4 text-primary hover:underline font-medium">
              {t("viewAllCategories")}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
        <Services />
      </section>

      {/* Popular Masters */}
      {popularMasters.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container px-4 mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {language === "en" ? "Top Masters in Dushanbe" : language === "tj" ? "Беҳтарин устоони Душанбе" : "Лучшие мастера Душанбе"}
              </h2>
              <p className="text-muted-foreground">
                {language === "en" ? "Highest rated professionals in your city" : language === "tj" ? "Устоон бо баландтарин рейтинг дар шаҳри шумо" : "Мастера с наивысшим рейтингом в вашем городе"}
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {popularMasters.map((master, i) => {
                const initials = master.full_name.split(" ").map(w => w[0]).join("").slice(0, 2);
                const gradient = gradients[i % gradients.length];
                return (
                  <motion.div key={master.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Link to={`/masters/${master.id}`}>
                      <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                        <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-md`}>
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-foreground group-hover:text-primary transition-colors">{master.full_name}</p>
                              <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{master.average_rating}</span>
                                <span className="text-xs text-muted-foreground">({master.total_reviews})</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {master.experience_years} {language === "en" ? "yrs" : "сол"}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {master.working_districts?.[0]}</span>
                            <span className="ml-auto font-semibold text-foreground">аз {master.price_min} сомонӣ</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link to="/masters">
                <Button variant="outline" size="lg" className="rounded-full px-8">
                  {language === "en" ? "View all masters" : language === "tj" ? "Ҳамаи устоон" : "Все мастера Душанбе"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("howItWorksTitle")}</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-xl">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-sm font-bold text-primary mb-2">{t("step")} {index + 1}</div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{t(step.titleKey)}</h3>
                  <p className="text-muted-foreground">{t(step.descKey)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-background">
        <div className="container px-4 mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {language === "en" ? "What Dushanbe Clients Say" : language === "tj" ? "Фикрҳои муштариёни Душанбе" : "Отзывы клиентов из Душанбе"}
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <Quote className="w-8 h-8 text-primary/20 mb-3" />
                    <p className="text-foreground mb-4 leading-relaxed">{t.text}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">— {t.name}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee banner */}
      <section className="py-12 bg-gradient-to-r from-primary to-emerald-500">
        <div className="container px-4 mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{t("qualityGuarantee")}</h3>
              <p className="text-white/90 text-lg">{t("qualityGuaranteeDesc")}</p>
            </div>
            <Button onClick={handleQuickOrder} size="lg" className="rounded-full px-8 bg-white text-primary hover:bg-white/90 font-semibold shadow-xl">
              {t("heroOrderButton")}
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => { setIsOrderModalOpen(false); setSelectedCategory(null); setSelectedServiceName(""); }}
        category={selectedCategory}
        initialServiceName={selectedServiceName}
      />
      <QuickBooking open={quickBookOpen} onOpenChange={setQuickBookOpen} />
    </div>
  );
};

export default Index;
