import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface Props {
  reviews: any[];
  master: any;
}

const PER_PAGE = 5;

export default function MasterReviews({ reviews, master }: Props) {
  const [showCount, setShowCount] = useState(PER_PAGE);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : Number(master.average_rating) || 0;

  const distribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0]; // 1-5
    reviews.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
    return dist;
  }, [reviews]);

  const totalReviews = reviews.length || master.total_reviews || 0;
  const visibleReviews = reviews.slice(0, showCount);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card>
        <CardContent className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-5">
            <Star className="w-5 h-5 text-primary" /> Отзывы ({totalReviews})
          </h2>

          {/* Rating summary */}
          {totalReviews > 0 && (
            <div className="flex flex-col sm:flex-row gap-6 mb-6 p-4 rounded-xl bg-muted/50">
              {/* Big number */}
              <div className="text-center sm:text-left shrink-0">
                <p className="text-5xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
                <div className="flex gap-0.5 justify-center sm:justify-start mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{totalReviews} отзывов</p>
              </div>

              {/* Distribution bars */}
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = distribution[star - 1];
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-3 text-muted-foreground">{star}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <Progress value={pct} className="h-2 flex-1" />
                      <span className="w-8 text-right text-muted-foreground text-xs">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review cards */}
          {totalReviews === 0 ? (
            <p className="text-center text-muted-foreground py-6">Пока нет отзывов</p>
          ) : (
            <div className="space-y-3">
              {visibleReviews.map((review) => (
                <div key={review.id} className="p-4 rounded-xl border border-border/50 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        К
                      </div>
                      <span className="text-sm font-medium text-foreground">Клиент</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))}

              {reviews.length > showCount && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setShowCount((c) => c + PER_PAGE)}
                  >
                    Показать ещё
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
