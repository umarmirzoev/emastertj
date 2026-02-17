import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, DollarSign, Clock, Headphones } from "lucide-react";

const About = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Shield, titleKey: "aboutFeature1Title", descKey: "aboutFeature1Desc" },
    { icon: DollarSign, titleKey: "aboutFeature2Title", descKey: "aboutFeature2Desc" },
    { icon: Clock, titleKey: "aboutFeature3Title", descKey: "aboutFeature3Desc" },
    { icon: Headphones, titleKey: "aboutFeature4Title", descKey: "aboutFeature4Desc" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{t("aboutTitle")}</h1>
            <p className="text-lg text-muted-foreground">{t("aboutDescription")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center p-6 rounded-2xl bg-muted">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg">
                  <f.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{t(f.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(f.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;
