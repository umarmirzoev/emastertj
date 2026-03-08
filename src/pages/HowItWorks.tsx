import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search, FileText, UserCheck, Eye, ClipboardCheck, Truck,
  Wrench, Star, Shield, Clock, CheckCircle, DollarSign, ArrowRight, Headphones,
} from "lucide-react";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    { icon: Search, title: "Выберите категорию", desc: "Просмотрите каталог из 20+ категорий бытовых услуг и найдите нужную." },
    { icon: FileText, title: "Выберите услугу", desc: "В каждой категории — конкретные услуги с ценами в сомони." },
    { icon: UserCheck, title: "Выберите мастера", desc: "Посмотрите рейтинг, опыт, отзывы и район работы каждого мастера." },
    { icon: Eye, title: "Посмотрите отзывы и примеры работ", desc: "Изучите реальные отзывы клиентов и фото выполненных работ." },
    { icon: ClipboardCheck, title: "Оставьте заявку", desc: "Заполните короткую форму: адрес, телефон, описание задачи." },
    { icon: CheckCircle, title: "Админ подтверждает заказ", desc: "Наш администратор проверяет заявку и назначает лучшего мастера." },
    { icon: Truck, title: "Мастер выезжает", desc: "Вы видите статус заказа в реальном времени: «В пути», «Прибыл»." },
    { icon: Wrench, title: "Работа выполняется", desc: "Мастер выполняет работу качественно, используя проверенные материалы." },
    { icon: Star, title: "Клиент оставляет отзыв", desc: "После завершения работы оцените мастера и оставьте отзыв." },
  ];

  const benefits = [
    { icon: Clock, title: "Быстро", desc: "Мастер приедет в течение 1 часа" },
    { icon: Shield, title: "Безопасно", desc: "Все мастера прошли проверку" },
    { icon: DollarSign, title: "Прозрачно", desc: "Цены известны заранее" },
    { icon: Headphones, title: "Удобно", desc: "Заказ за 2 минуты онлайн" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container px-4 mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">Как это работает</h1>
            <p className="text-lg text-muted-foreground">
              От выбора услуги до готового результата — всего 9 простых шагов. Весь процесс прозрачный и удобный.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-16">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />
            <div className="space-y-6">
              {steps.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-5 sm:p-6 flex items-start gap-4">
                      <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg flex-shrink-0">
                        <step.icon className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-primary">Шаг {i + 1}</span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-foreground text-center mb-10">
            Преимущества сервиса
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {benefits.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-6 rounded-2xl bg-card border shadow-sm">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{b.title}</h3>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Guarantees */}
      <section className="py-16">
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-4">Безопасность и гарантии</h2>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            Все мастера проходят тщательную проверку документов и навыков. Мы гарантируем качество каждой выполненной работы. 
            Если результат вас не устроит — мастер вернётся и исправит бесплатно.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Проверка документов", "Гарантия на работы", "Поддержка 24/7", "Страхование"].map((item, i) => (
              <span key={i} className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary to-emerald-500">
        <div className="container px-4 mx-auto text-center max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Готовы заказать мастера?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Выберите услугу и оформите заявку прямо сейчас
            </p>
            <Link to="/categories">
              <Button size="lg" variant="secondary" className="rounded-full px-8 shadow-lg">
                Заказать мастера <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
