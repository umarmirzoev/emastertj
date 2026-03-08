import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/hooks/useCart";
import { motion } from "framer-motion";
import {
  ShoppingCart, Star, ArrowLeft, Package, Phone, Minus, Plus,
  CheckCircle, Wrench, Truck,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [withInstall, setWithInstall] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("shop_products")
        .select("*, shop_categories(name)")
        .eq("id", id!)
        .single();
      setProduct(data);
      if (data?.category_id) {
        const { data: rel } = await supabase
          .from("shop_products")
          .select("*, shop_categories(name)")
          .eq("category_id", data.category_id)
          .neq("id", id!)
          .limit(4);
        setRelated(rel || []);
      }
      setLoading(false);
    };
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 mx-auto py-16">
          <div className="h-96 bg-muted animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 mx-auto py-16 text-center">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Товар не найден</p>
          <Link to="/shop"><Button className="mt-4 rounded-full">Вернуться в магазин</Button></Link>
        </div>
      </div>
    );
  }

  const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0;
  const totalPrice = product.price * qty + (withInstall && product.installation_price ? product.installation_price : 0);
  const specs = typeof product.specs === "object" && product.specs !== null ? product.specs : {};

  const handleBuyNow = async () => {
    await addToCart(product.id, withInstall);
    window.location.href = "/cart";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 mx-auto py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/shop" className="hover:text-primary">Магазин</Link>
          <span>/</span>
          <Link to={`/shop/category/${product.category_id}`} className="hover:text-primary">{product.shop_categories?.name}</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square bg-muted/20 rounded-2xl border border-border flex items-center justify-center p-8 relative">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <Package className="w-32 h-32 text-muted-foreground/20" />
              )}
              {discount > 0 && <Badge className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3">-{discount}%</Badge>}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <p className="text-sm text-primary font-medium mb-1">{product.shop_categories?.name}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews_count} отзывов)</span>
            </div>

            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-foreground">{product.price} сомонӣ</span>
              {product.old_price && <span className="text-lg text-muted-foreground line-through">{product.old_price} с.</span>}
            </div>

            <div className="flex items-center gap-2">
              {product.in_stock ? (
                <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3 mr-1" />В наличии</Badge>
              ) : (
                <Badge variant="secondary">Нет в наличии</Badge>
              )}
              <Badge variant="outline" className="gap-1"><Truck className="w-3 h-3" />Доставка</Badge>
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Specs */}
            {Object.keys(specs).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Характеристики</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm py-1.5 px-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium text-foreground">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Installation option */}
            {product.installation_price && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox checked={withInstall} onCheckedChange={(v) => setWithInstall(!!v)} className="mt-1" />
                    <div>
                      <p className="font-medium text-foreground flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-primary" /> Нужна установка мастером?
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Профессиональная установка — <span className="font-semibold text-primary">{product.installation_price} сомонӣ</span>
                      </p>
                    </div>
                  </label>
                </CardContent>
              </Card>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Количество:</span>
              <div className="flex items-center border border-border rounded-full overflow-hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="w-4 h-4" /></Button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={() => setQty(qty + 1)}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* Total */}
            <div className="p-4 bg-muted/50 rounded-xl">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Товар ({qty} шт.)</span>
                <span>{product.price * qty} с.</span>
              </div>
              {withInstall && product.installation_price && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Установка</span>
                  <span>{product.installation_price} с.</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2">
                <span>Итого</span>
                <span className="text-primary">{totalPrice} сомонӣ</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button size="lg" className="flex-1 rounded-full gap-2" onClick={() => addToCart(product.id, withInstall)} disabled={!product.in_stock}>
                <ShoppingCart className="w-5 h-5" /> В корзину
              </Button>
              <Button size="lg" variant="outline" className="flex-1 rounded-full" onClick={handleBuyNow} disabled={!product.in_stock}>
                Купить сейчас
              </Button>
            </div>

            <a href="tel:+992979117007" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <Phone className="w-4 h-4" /> +992 979 117 007
            </a>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-foreground mb-6">Похожие товары</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <Card key={p.id} className="hover:shadow-lg transition-all overflow-hidden border-border">
                  <div className="aspect-square bg-muted/30 flex items-center justify-center p-4">
                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" /> : <Package className="w-12 h-12 text-muted-foreground/30" />}
                  </div>
                  <CardContent className="p-3">
                    <Link to={`/shop/product/${p.id}`}>
                      <h3 className="text-sm font-medium text-foreground hover:text-primary line-clamp-2 mb-2">{p.name}</h3>
                    </Link>
                    <span className="text-lg font-bold text-foreground">{p.price} с.</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
