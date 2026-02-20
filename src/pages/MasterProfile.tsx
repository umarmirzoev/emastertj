import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MasterProfile() {
  const { id } = useParams<{ id: string }>();
  const [master, setMaster] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const perPage = 10;

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const [profileRes, reviewsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", id).single(),
        supabase.from("reviews").select("*, profiles!reviews_client_id_fkey(full_name)").eq("master_id", id).order("created_at", { ascending: false }),
      ]);
      setMaster(profileRes.data);
      setReviews(reviewsRes.data || []);
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

  const paginatedReviews = reviews.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {master.full_name?.charAt(0) || "М"}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{master.full_name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{master.average_rating || "0.0"}</span>
                  <span className="text-muted-foreground text-sm">({master.total_reviews || 0} отзывов)</span>
                </div>
                {master.experience_years && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" /> {master.experience_years} лет опыта
                  </div>
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
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="rounded-full gap-2" asChild>
                  <a href={`tel:${master.phone}`}><Phone className="w-3.5 h-3.5" /> Позвонить</a>
                </Button>
                <Button size="sm" variant="outline" className="rounded-full gap-2" asChild>
                  <a href={`https://wa.me/${master.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews */}
        <h2 className="text-lg font-bold text-foreground mb-4">Отзывы ({reviews.length})</h2>
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
                      <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                </CardContent>
              </Card>
            ))}
            {reviews.length > perPage && (
              <div className="flex justify-center gap-2 pt-2">
                <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-full">
                  Назад
                </Button>
                <Button size="sm" variant="outline" disabled={(page + 1) * perPage >= reviews.length} onClick={() => setPage(page + 1)} className="rounded-full">
                  Далее
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
