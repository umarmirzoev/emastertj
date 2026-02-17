import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Search, FileText, Truck } from "lucide-react";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    { icon: Search, titleKey: "howItWorksStep1Title", descKey: "howItWorksStep1Desc" },
    { icon: FileText, titleKey: "howItWorksStep2Title", descKey: "howItWorksStep2Desc" },
    { icon: Truck, titleKey: "howItWorksStep3Title", descKey: "howItWorksStep3Desc" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t("howItWorksTitle")}</h1>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-xl">
                  <step.icon className="w-12 h-12 text-white" />
                </div>
                <div className="text-sm font-bold text-primary mb-2">{t("step")} {i + 1}</div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{t(step.titleKey)}</h3>
                <p className="text-muted-foreground text-lg">{t(step.descKey)}</p>
              </motion.div>
            ))}
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center text-lg text-muted-foreground mt-16">
            {t("howItWorksFooter")}
          </motion.p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HowItWorks;
