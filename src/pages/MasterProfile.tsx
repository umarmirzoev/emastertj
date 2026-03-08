import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Phone, MessageCircle, Camera, Briefcase } from "lucide-react";

export default function MasterProfile() {
  const { id } = useParams<{ id: string }>();
  const [master, setMaster] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewPage, setReviewPage] = useState(0);
  const perPage = 10;

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const [profileRes, reviewsRes, portfolioRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", id).single(),
        supabase.from("reviews").select("*, profiles!reviews_client_id_fkey(full_name)").eq("master_id", id).order("created_at", { ascending: false }),
        supabase.from("master_portfolio").select("*").eq("master_id", id).order("created_at", { ascending: false }),
      ]);
      setMaster(profileRes.data);
      setReviews(reviewsRes.data || []);
      setPortfolio(portfolioRes.data || []);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!master) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Мастер не найден</p>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : master.average_rating || "0.0";

  const paginatedReviews = reviews.slice(reviewPage * perPage, (reviewPage + 1) * perPage);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-3xl">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary to-emerald-400" />
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                  {master.full_name?.charAt(0) || "М"}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{master.full_name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{avgRating}</span>
                    <span className="text-muted-foreground text-sm">({reviews.length || master.total_reviews || 0} отзывов)</span>
                  </div>
                  {master.experience_years && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" /> {master.experience_years} сол таҷриба
                    </div>
                  )}
                  {master.bio && (
                    <p className="text-sm text-muted-foreground mt-2">{master.bio}</p>
                  )}
                </div>
              </div>

              {master.service_categories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {master.service_categories.map((cat: string) => (
                    <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                  ))}
                </div>
              )}

              {master.working_districts?.length > 0 && (
                <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {master.working_districts.join(", ")}
                </div>
              )}

              {master.phone && (
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button size="sm" className="rounded-full gap-2 h-11 flex-1 sm:flex-none bg-gradient-to-r from-primary to-emerald-500" asChild>
                    <a href={`tel:${master.phone}`}><Phone className="w-3.5 h-3.5" /> Позвонить</a>
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full gap-2 h-11 flex-1 sm:flex-none" asChild>
                    <a href={`https://wa.me/${master.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio */}
        {portfolio.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" /> Примеры работ ({portfolio.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {portfolio.map((item) => (
                <Card key={item.id} className="overflow-hidden group">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    {item.category && <p className="text-xs text-muted-foreground">{item.category}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reviews */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" /> Отзывы ({reviews.length})
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold text-foreground">{avgRating}</span>
              </div>
            )}
          </div>
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">Пока нет отзывов</CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {paginatedReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {review.profiles?.full_name || "Клиент"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                  </CardContent>
                </Card>
              ))}
              {reviews.length > perPage && (
                <div className="flex justify-center gap-2 pt-2">
                  <Button size="sm" variant="outline" disabled={reviewPage === 0} onClick={() => setReviewPage(reviewPage - 1)} className="rounded-full">
                    Назад
                  </Button>
                  <Button size="sm" variant="outline" disabled={(reviewPage + 1) * perPage >= reviews.length} onClick={() => setReviewPage(reviewPage + 1)} className="rounded-full">
                    Показать ещё
                  </Button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
