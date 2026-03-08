import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield, DollarSign, Clock, Headphones, CheckCircle, Star,
  Users, Wrench, Heart, Zap, Target, Award, ArrowRight, Truck,
} from "lucide-react";

const About = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Shield, title: "Проверенные мастера", desc: "Все мастера проходят строгую проверку документов, навыков и рекомендаций перед тем, как начать работу на платформе." },
    { icon: DollarSign, title: "Прозрачные цены", desc: "Вы знаете стоимость до начала работ. Никаких скрытых платежей и неожиданных доплат." },
    { icon: Clock, title: "Быстрый выезд", desc: "Мастер приедет в течение 1 часа или в удобное для вас время. Работаем по всему Душанбе." },
    { icon: Headphones, title: "Поддержка 24/7", desc: "Наша служба поддержки работает круглосуточно. Мы всегда на связи и решим любой вопрос." },
    { icon: Truck, title: "Удобный заказ", desc: "Оформите заявку за 2 минуты через сайт. Без звонков и ожиданий — всё онлайн." },
  ];

  const stats = [
    { value: "1000+", label: "мастеров", icon: Users },
    { value: "120+", label: "услуг", icon: Wrench },
    { value: "5000+", label: "заказов", icon: CheckCircle },
    { value: "4.8", label: "средний рейтинг", icon: Star },
  ];

  const values = [
    { icon: Shield, title: "Надёжность", desc: "Мы гарантируем качество каждой работы и несём ответственность за результат." },
    { icon: Zap, title: "Скорость", desc: "Быстрый подбор мастера и оперативный выезд — наш приоритет." },
    { icon: Target, title: "Качество", desc: "Используем проверенные материалы и современные технологии." },
    { icon: Heart, title: "Честность", desc: "Прозрачные цены, честные отзывы и открытые условия работы." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container px-4 mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">О компании Мастер Час</h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Мастер Час — это современный маркетплейс бытовых услуг в Душанбе, который помогает быстро найти надёжного мастера для любых задач по дому и офису. 
              Мы соединяем клиентов с проверенными специалистами, обеспечивая качество, скорость и прозрачность на каждом этапе.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <Award className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">Наша миссия</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Сделать бытовые услуги в Душанбе быстрыми, безопасными, прозрачными и доступными каждому. 
              Мы стремимся к тому, чтобы каждый житель города мог получить качественную помощь мастера за считанные минуты — без лишних звонков, поисков и переплат.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 md:py-20">
        <div className="container px-4 mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            Почему выбирают нас
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg mb-4">
                      <f.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-br from-primary to-emerald-500">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <s.icon className="w-8 h-8 text-primary-foreground/80 mx-auto mb-2" />
                <p className="text-4xl md:text-5xl font-bold text-primary-foreground">{s.value}</p>
                <p className="text-primary-foreground/80 text-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20">
        <div className="container px-4 mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            Наши ценности
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-6 rounded-2xl bg-muted/50">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <v.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 mx-auto max-w-4xl">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-bold text-foreground text-center mb-10">
            Как мы работаем
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Вы оставляете заявку", desc: "Выберите услугу и опишите задачу за 2 минуты" },
              { step: "2", title: "Мы подбираем мастера", desc: "Администратор подтверждает заказ и назначает лучшего специалиста" },
              { step: "3", title: "Мастер выполняет работу", desc: "Специалист приезжает, выполняет работу качественно и в срок" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container px-4 mx-auto text-center max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Выберите услугу и закажите мастера уже сегодня
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Присоединяйтесь к тысячам довольных клиентов в Душанбе
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/categories">
                <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-primary to-emerald-500 shadow-lg">
                  Выбрать услугу <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/contacts">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  Связаться с нами
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
