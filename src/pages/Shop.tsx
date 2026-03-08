import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { motion } from "framer-motion";
import {
  ShoppingCart, Star, Phone, Zap, Droplets, Lightbulb, Wrench,
  Camera, Lock, Tv, PaintBucket, PlugZap, Package, ArrowRight,
  Percent, TrendingUp, Shield, Clock, Truck, Headphones,
  ChevronLeft, ChevronRight, Sparkles, Award,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Zap, Droplets, Lightbulb, Wrench, Camera, Lock, Tv, PaintBucket, PlugZap, Package,
};

export default function Shop() {
  const [categories, setCategories] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [discounted, setDiscounted] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [byCategory, setByCategory] = useState<Record<string, any[]>>({});
  const [installProduct, setInstallProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, itemCount } = useCart();

  useEffect(() => {
    const load = async () => {
      const [catsRes, popRes, discRes, recRes, allRes] = await Promise.all([
        supabase.from("shop_categories").select("*").order("sort_order"),
        supabase.from("shop_products").select("*, shop_categories(name)").eq("is_popular", true).eq("is_approved", true).limit(12),
        supabase.from("shop_products").select("*, shop_categories(name)").eq("is_discounted", true).eq("is_approved", true).limit(8),
        supabase.from("shop_products").select("*, shop_categories(name)").eq("is_approved", true).gte("rating", 4.5).order("reviews_count", { ascending: false }).limit(8),
        supabase.from("shop_products").select("*, shop_categories(name)").eq("is_approved", true).order("created_at", { ascending: false }).limit(200),
      ]);
      const cats = catsRes.data || [];
      setCategories(cats);
      setPopular(popRes.data || []);
      setDiscounted(discRes.data || []);
      setRecommended(recRes.data || []);

      // Group by category (first 3 categories with products)
      const all = allRes.data || [];
      const grouped: Record<string, any[]> = {};
      for (const cat of cats.slice(0, 4)) {
        const items = all.filter((p: any) => p.category_id === cat.id).slice(0, 10);
        if (items.length > 0) grouped[cat.name] = items;
      }
      setByCategory(grouped);

      // Find a product with installation for the promo
      const installP = all.find((p: any) => p.installation_price && p.image_url);
      setInstallProduct(installP || null);

      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ===== HERO BANNER ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-emerald-50/80 to-background dark:from-primary/5 dark:via-emerald-950/30 dark:to-background" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="container px-4 mx-auto py-16 md:py-28 relative z-10">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Маркетплейс товаров
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-5 leading-[1.1] tracking-tight">
                Магазин{" "}
                <span className="text-primary">Master Chas</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed">
                Товары для ремонта, дома и установки — с доставкой и возможностью заказать мастера для монтажа
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link to="#categories">
                  <Button size="lg" className="rounded-full gap-2 px-8 h-12 text-base shadow-lg shadow-primary/20">
                    Перейти в каталог <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/masters">
                  <Button size="lg" variant="outline" className="rounded-full gap-2 px-8 h-12 text-base">
                    <Wrench className="w-4 h-4" /> Найти мастера для установки
                  </Button>
                </Link>
              </div>
              {/* Quick stats */}
              <div className="flex items-center gap-6 mt-10 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Package className="w-4 h-4 text-primary" /> 96+ товаров</span>
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" /> 12 категорий</span>
                <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-primary" /> Доставка</span>
              </div>
            </motion.div>
          </div>
          {/* Cart floating badge */}
          <Link to="/cart" className="absolute top-8 right-8 hidden md:flex">
            <Button variant="outline" className="rounded-full gap-2 bg-background/80 backdrop-blur-sm border-border shadow-lg">
              <ShoppingCart className="w-4 h-4" />
              Корзина {itemCount > 0 && <Badge className="bg-primary text-primary-foreground ml-1">{itemCount}</Badge>}
            </Button>
          </Link>
        </div>
      </section>

      {/* ===== CATEGORIES GRID ===== */}
      <section id="categories" className="py-14">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Категории товаров</h2>
              <p className="text-muted-foreground text-sm mt-1">Выберите нужную категорию</p>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-muted animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat, i) => {
                const Icon = ICON_MAP[cat.icon] || Package;
                return (
                  <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link to={`/shop/category/${cat.id}`}>
                      <Card className="hover:shadow-xl transition-all hover:-translate-y-1.5 cursor-pointer border-border group h-full">
                        {cat.image_url ? (
                          <div className="h-20 overflow-hidden rounded-t-lg">
                            <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                        ) : null}
                        <CardContent className="p-4 text-center">
                          <div className="w-11 h-11 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2.5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                            <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== DISCOUNT PRODUCTS ===== */}
      {discounted.length > 0 && (
        <section className="py-14 bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/10 dark:to-orange-950/10">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Percent className="w-5 h-5 text-destructive" />
                  </div>
                  Акции и скидки
                </h2>
                <p className="text-muted-foreground text-sm mt-1">Успейте купить по выгодной цене</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {discounted.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
            </div>
          </div>
        </section>
      )}

      {/* ===== POPULAR PRODUCTS ===== */}
      <section className="py-14">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                Популярные товары
              </h2>
              <p className="text-muted-foreground text-sm mt-1">Самые востребованные товары</p>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="h-72 bg-muted animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {popular.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
            </div>
          )}
        </div>
      </section>

      {/* ===== PRODUCT + INSTALLATION PROMO ===== */}
      {installProduct && (
        <section className="py-14 bg-gradient-to-br from-primary/5 to-emerald-50/50 dark:from-primary/5 dark:to-emerald-950/10">
          <div className="container px-4 mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                  <Wrench className="w-3 h-3 mr-1" /> Товар + Установка
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Купите товар и закажите<br />установку мастером
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Не нужно искать специалиста отдельно — выберите товар, добавьте установку, и мы пришлём проверенного мастера
                </p>

                <Card className="border-primary/20 bg-background shadow-lg max-w-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                        <img src={installProduct.image_url} alt={installProduct.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{installProduct.name}</p>
                        <p className="text-lg font-bold text-foreground mt-1">{installProduct.price} сомонӣ</p>
                        <p className="text-sm text-primary font-medium">
                          + Установка мастером: {installProduct.installation_price} сомонӣ
                        </p>
                      </div>
                    </div>
                    <Link to={`/shop/product/${installProduct.id}`}>
                      <Button className="w-full mt-4 rounded-full gap-2">
                        <ShoppingCart className="w-4 h-4" /> Купить с установкой
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="hidden md:flex justify-center">
                <div className="relative">
                  <div className="w-80 h-80 rounded-3xl overflow-hidden shadow-2xl">
                    <img src={installProduct.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground rounded-2xl px-5 py-3 shadow-xl">
                    <p className="text-sm font-bold">Установка от {installProduct.installation_price} с.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ===== RECOMMENDED PRODUCTS ===== */}
      {recommended.length > 0 && (
        <section className="py-14">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  Рекомендуем
                </h2>
                <p className="text-muted-foreground text-sm mt-1">Лучшие товары по рейтингу и отзывам</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommended.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
            </div>
          </div>
        </section>
      )}

      {/* ===== PRODUCTS BY CATEGORY (horizontal scroll rows) ===== */}
      {Object.entries(byCategory).map(([catName, products]) => (
        <section key={catName} className="py-10 border-t border-border">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">{catName}</h2>
              <Link to={`/shop/category/${categories.find(c => c.name === catName)?.id || ""}`}>
                <Button variant="ghost" size="sm" className="text-primary gap-1 rounded-full">
                  Все товары <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <HorizontalScroll>
              {products.map(p => (
                <div key={p.id} className="min-w-[180px] md:min-w-[220px] snap-start">
                  <ProductCard product={p} onAdd={addToCart} />
                </div>
              ))}
            </HorizontalScroll>
          </div>
        </section>
      ))}

      {/* ===== TRUST SECTION ===== */}
      <section className="py-16 bg-foreground text-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Почему покупать у Master Chas?</h2>
            <p className="text-background/60 max-w-lg mx-auto">Мы объединяем магазин и сервис мастеров — всё в одном месте</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Shield, title: "Проверенные мастера", desc: "Все мастера проходят проверку" },
              { icon: Award, title: "Гарантия работ", desc: "Гарантия на все услуги" },
              { icon: Truck, title: "Быстрая доставка", desc: "Доставка по Душанбе" },
              { icon: Headphones, title: "Поддержка 24/7", desc: "Всегда на связи" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-background/50">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-background/60 mb-3">Нужна помощь с выбором? Позвоните нам</p>
            <a href="tel:+992979117007">
              <Button size="lg" className="rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base shadow-xl shadow-primary/30">
                <Phone className="w-5 h-5" /> +992 979 117 007
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ===== Horizontal scroll container ===== */
function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };
  return (
    <div className="relative group/scroll">
      <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-background/90 shadow-lg border border-border flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity -translate-x-3">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div ref={ref} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2" style={{ scrollbarWidth: "none" }}>
        {children}
      </div>
      <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-background/90 shadow-lg border border-border flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity translate-x-3">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ===== Product Card ===== */
function ProductCard({ product: p, onAdd }: { product: any; onAdd: (id: string) => void }) {
  const discount = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : 0;
  return (
    <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden border-border h-full flex flex-col">
      <div className="relative aspect-square bg-muted/20 overflow-hidden">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground/20" />
          </div>
        )}
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs shadow-md">-{discount}%</Badge>
        )}
        {p.installation_price && (
          <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[10px] shadow-sm">+ установка</Badge>
        )}
        {p.seller_type === "master" && (
          <Badge className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-[10px] gap-0.5">
            <Award className="w-2.5 h-2.5" /> От мастера
          </Badge>
        )}
        {!p.in_stock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Badge variant="secondary">Нет в наличии</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-3 flex flex-col flex-1">
        <p className="text-[11px] text-muted-foreground mb-1">{p.shop_categories?.name || ""}</p>
        <Link to={`/shop/product/${p.id}`}>
          <h3 className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors mb-2 min-h-[2.5rem]">
            {p.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-muted-foreground">{p.rating} ({p.reviews_count || 0})</span>
        </div>
        <div className="flex items-end gap-2 mb-3 mt-auto">
          <span className="text-lg font-bold text-foreground">{p.price} с.</span>
          {p.old_price && <span className="text-xs text-muted-foreground line-through">{p.old_price} с.</span>}
        </div>
        <div className="flex gap-1.5">
          <Link to={`/shop/product/${p.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full rounded-full text-xs h-8">Подробнее</Button>
          </Link>
          <Button size="sm" className="rounded-full text-xs h-8 px-3" onClick={() => onAdd(p.id)} disabled={!p.in_stock}>
            <ShoppingCart className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
