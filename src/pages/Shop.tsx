import { useState, useEffect } from "react";
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
  Camera, Lock, Tv, PaintBucket, PlugZap, Package, ArrowRight, Percent, TrendingUp,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Zap, Droplets, Lightbulb, Wrench, Camera, Lock, Tv, PaintBucket, PlugZap, Package,
};

export default function Shop() {
  const [categories, setCategories] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [discounted, setDiscounted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, itemCount } = useCart();

  useEffect(() => {
    const load = async () => {
      const [catsRes, popRes, discRes] = await Promise.all([
        supabase.from("shop_categories").select("*").order("sort_order"),
        supabase.from("shop_products").select("*, shop_categories(name)").eq("is_popular", true).limit(8),
        supabase.from("shop_products").select("*, shop_categories(name)").eq("is_discounted", true).limit(6),
      ]);
      setCategories(catsRes.data || []);
      setPopular(popRes.data || []);
      setDiscounted(discRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-emerald-50 dark:to-emerald-950/20">
        <div className="container px-4 mx-auto py-16 md:py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">🛒 Наш магазин</Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Магазин <span className="text-primary">Master Chas</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Товары для ремонта, дома и установки — с доставкой и возможностью заказать мастера
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/cart">
                <Button variant="outline" className="rounded-full gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Корзина {itemCount > 0 && <Badge className="bg-primary text-primary-foreground">{itemCount}</Badge>}
                </Button>
              </Link>
              <a href="tel:+992979117007" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" /> +992 979 117 007
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container px-4 mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Категории товаров</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat, i) => {
                const Icon = ICON_MAP[cat.icon] || Package;
                return (
                  <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/shop/category/${cat.id}`}>
                      <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-border group">
                        <CardContent className="p-5 text-center">
                          <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <p className="text-sm font-medium text-foreground">{cat.name}</p>
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

      {/* Discounted */}
      {discounted.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/10 dark:to-orange-950/10">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Percent className="w-6 h-6 text-red-500" /> Скидки и акции
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {discounted.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
            </div>
          </div>
        </section>
      )}

      {/* Popular */}
      <section className="py-12">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" /> Популярные товары
            </h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popular.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
            </div>
          )}
        </div>
      </section>

      {/* Support */}
      <section className="py-12 bg-primary/5">
        <div className="container px-4 mx-auto text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Нужна помощь с выбором?</h3>
          <p className="text-muted-foreground mb-4">Позвоните нам — подберём товары и мастера</p>
          <a href="tel:+992979117007">
            <Button size="lg" className="rounded-full gap-2">
              <Phone className="w-5 h-5" /> +992 979 117 007
            </Button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ProductCard({ product: p, onAdd }: { product: any; onAdd: (id: string) => void }) {
  const discount = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : 0;
  return (
    <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden border-border">
      <div className="relative aspect-square bg-muted/20 overflow-hidden">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">-{discount}%</Badge>
        )}
        {p.installation_price && (
          <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[10px]">+ установка</Badge>
        )}
        {p.seller_type === "master" && (
          <Badge className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-[10px]">От мастера</Badge>
        )}
      </div>
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground mb-1">{p.shop_categories?.name || ""}</p>
        <Link to={`/shop/product/${p.id}`}>
          <h3 className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors mb-2 min-h-[2.5rem]">
            {p.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-muted-foreground">{p.rating}</span>
        </div>
        <div className="flex items-end gap-2 mb-3">
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
