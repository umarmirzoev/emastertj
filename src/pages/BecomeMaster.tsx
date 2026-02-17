import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, TrendingUp, Calendar, DollarSign, Headphones } from "lucide-react";

const BecomeMaster = () => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", specialty: "", experience: "" });

  const benefits = [
    { icon: TrendingUp, key: "becomeMasterBenefit1" },
    { icon: Calendar, key: "becomeMasterBenefit2" },
    { icon: DollarSign, key: "becomeMasterBenefit3" },
    { icon: Headphones, key: "becomeMasterBenefit4" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t("becomeMasterTitle")}</h1>
            <p className="text-lg text-muted-foreground">{t("becomeMasterSubtitle")}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {benefits.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4 p-4 rounded-xl bg-muted">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold text-foreground">{t(b.key)}</span>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-md mx-auto bg-card border border-border rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">{t("becomeMasterFormTitle")}</h2>
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <p className="text-center font-medium text-foreground">{t("becomeMasterFormSuccess")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder={t("becomeMasterFormName")} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <Input placeholder={t("becomeMasterFormPhone")} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required type="tel" />
                <Input placeholder={t("becomeMasterFormSpecialty")} value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} required />
                <Input placeholder={t("becomeMasterFormExperience")} value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} type="number" />
                <Button type="submit" className="w-full rounded-full">{t("becomeMasterFormSubmit")}</Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BecomeMaster;
