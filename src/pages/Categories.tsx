import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Services } from "@/components/Services";
import OrderModal from "@/components/OrderModal";

const Categories = () => {
  const { t } = useLanguage();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedServiceName, setSelectedServiceName] = useState("");

  const handleOrderService = (serviceName: string, categoryKey: string) => {
    setSelectedCategory("other");
    setSelectedServiceName(serviceName);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t("categoriesTitle")}</h1>
            <p className="text-lg text-muted-foreground">{t("categoriesDescription")}</p>
          </motion.div>
        </div>
        <Services onOrderService={handleOrderService} />
      </section>
      <Footer />
      <OrderModal isOpen={isOrderModalOpen} onClose={() => { setIsOrderModalOpen(false); setSelectedCategory(null); setSelectedServiceName(""); }} category={selectedCategory} initialServiceName={selectedServiceName} />
    </div>
  );
};

export default Categories;
