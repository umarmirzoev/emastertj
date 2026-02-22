import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Services } from "@/components/Services";
import OrderModal from "@/components/OrderModal";
import {
  Zap, Droplets, DoorOpen, Tv, MoreHorizontal,
  Clock, Shield, Star, CheckCircle,
  Phone, Siren, Search, FileText, Truck, ArrowRight,
} from "lucide-react";

const Index = () => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedServiceName, setSelectedServiceName] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const categories = [
    { id: "electric", icon: Zap, labelRu: "Свет", labelTj: "Барқ", labelEn: "Electric", color: "from-amber-400 to-yellow-500", bgColor: "bg-amber-50 dark:bg-amber-950/30" },
    { id: "plumbing", icon: Droplets, labelRu: "Вода", labelTj: "Об", labelEn: "Water", color: "from-sky-400 to-blue-500", bgColor: "bg-sky-50 dark:bg-sky-950/30" },
    { id: "doors", icon: DoorOpen, labelRu: "Дверь", labelTj: "Дар", labelEn: "Door", color: "from-amber-600 to-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950/30" },
    { id: "appliances", icon: Tv, labelRu: "Техника", labelTj: "Техника", labelEn: "Appliances", color: "from-violet-400 to-purple-500", bgColor: "bg-violet-50 dark:bg-violet-950/30" },
    { id: "other", icon: MoreHorizontal, labelRu: "Другое", labelTj: "Дигар", labelEn: "Other", color: "from-slate-400 to-slate-600", bgColor: "bg-slate-50 dark:bg-slate-900/30" },
  ];

  const getLabel = (cat: (typeof categories)[0]) => {
    if (language === "ru") return cat.labelRu;
    if (language === "tj") return cat.labelTj;
    return cat.labelEn;
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsOrderModalOpen(true);
  };

  const handleQuickOrder = () => {
    setSelectedCategory("other");
    setSelectedServiceName("");
    setIsOrderModalOpen(true);
  };

  const handleOrderService = (serviceName: string, categoryKey: string) => {
    setSelectedCategory("other");
    setSelectedServiceName(serviceName);
    setIsOrderModalOpen(true);
  };

  const steps = [
    { icon: Search, titleKey: "howItWorksStep1Title", descKey: "howItWorksStep1Desc" },
    { icon: FileText, titleKey: "howItWorksStep2Title", descKey: "howItWorksStep2Desc" },
    { icon: Truck, titleKey: "howItWorksStep3Title", descKey: "howItWorksStep3Desc" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative pt-8 pb-12 md:pt-16 md:pb-20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container px-4 mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-center max-w-4xl mx-auto mb-8 md:mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 md:mb-6 tracking-tight leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-lg md:text-xl font-medium text-primary mb-3">{t("heroSubtitle")}</p>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">{t("heroDescription")}</p>
          </motion.div>

          {/* Category buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-5 max-w-4xl mx-auto mb-8">
            {categories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`group relative p-5 md:p-6 rounded-2xl ${cat.bgColor} border-2 border-transparent hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 mx-auto mb-2 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}>
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <span className="text-sm md:text-base font-semibold text-foreground">{getLabel(cat)}</span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto mb-12">
            <Button onClick={handleQuickOrder} size="lg" className="flex-1 rounded-full px-8 py-6 text-base font-semibold shadow-xl hover:shadow-2xl transition-all bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90">
              <Phone className="w-5 h-5 mr-2" />
              {t("heroOrderButton")}
            </Button>
            <Button onClick={() => { setSelectedCategory("urgent"); setIsOrderModalOpen(true); }} variant="outline" size="lg" className="flex-1 border-2 border-destructive/30 text-destructive rounded-full px-6 py-6 text-base font-semibold group">
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

      {/* Services */}
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
        <Services onOrderService={handleOrderService} />
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4 mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("howItWorksTitle")}</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 * index }} className="text-center">
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
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="text-center mt-12">
            <p className="text-lg text-muted-foreground mb-6">{t("howItWorksFooter")}</p>
            <Link to="/how-it-works">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                {t("learnMore")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Guarantee banner */}
      <section className="py-12 bg-gradient-to-r from-primary to-emerald-500">
        <div className="container px-4 mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
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
    </div>
  );
};

export default Index;
