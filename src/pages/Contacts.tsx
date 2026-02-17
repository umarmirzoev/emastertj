import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Phone, Mail, Clock } from "lucide-react";

const Contacts = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t("contactsTitle")}</h1>
            <p className="text-lg text-muted-foreground">{t("contactsDescription")}</p>
          </motion.div>
          <div className="grid gap-6">
            {[
              { icon: Phone, label: t("contactsPhone"), value: "+992 000 000 000", href: "tel:+992000000000" },
              { icon: Mail, label: t("contactsEmail"), value: "support@masterchas.tj", href: "mailto:support@masterchas.tj" },
              { icon: Clock, label: t("contactsWorkHours"), value: t("contactsWorkHoursValue"), href: null },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4 p-6 rounded-2xl bg-muted">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg flex-shrink-0">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-lg font-semibold text-foreground hover:text-primary transition-colors">{item.value}</a>
                  ) : (
                    <p className="text-lg font-semibold text-foreground">{item.value}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contacts;
