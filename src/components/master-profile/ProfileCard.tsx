import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Phone, MessageCircle, CheckCircle, Shield, Award, Briefcase } from "lucide-react";

interface Props {
  master: any;
  reviews: any[];
  completedOrders: number;
  onBook: () => void;
}

export default function MasterProfileCard({ master, reviews, completedOrders, onBook }: Props) {
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
    : master.average_rating || "5.0";

  const initials = master.full_name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2) || "М";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-emerald-400" />
        <CardContent className="p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-xl shrink-0">
              {initials}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{master.full_name}</h1>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <CheckCircle className="w-3 h-3 mr-1" /> Проверен
                </Badge>
              </div>

              {master.service_categories?.length > 0 && (
                <p className="text-muted-foreground mt-1">{master.service_categories[0]}</p>
              )}

              {/* Rating row */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={`w-5 h-5 ${i <= Math.round(Number(avgRating)) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <span className="text-lg font-bold ml-1">{avgRating}</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  ({reviews.length || master.total_reviews || 0} отзывов)
                </span>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {master.experience_years > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {master.experience_years} сол таҷриба
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" /> {completedOrders} заказов
                </span>
                {master.working_districts?.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {master.working_districts[0]}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mt-4 inline-block px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
                <span className="text-sm text-muted-foreground">Нархи хизмат аз </span>
                <span className="text-xl font-bold text-foreground">{master.price_min || 50} сомонӣ</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          {master.service_categories?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {master.service_categories.map((cat: string) => (
                <Badge key={cat} variant="secondary" className="text-sm px-3 py-1">{cat}</Badge>
              ))}
            </div>
          )}

          {/* Action buttons (mobile/tablet) */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:hidden">
            <Button
              size="lg"
              className="flex-1 rounded-full h-12 text-base font-semibold shadow-lg bg-gradient-to-r from-primary to-emerald-500"
              onClick={onBook}
            >
              Заказать мастера
            </Button>
            {master.phone && (
              <>
                <Button size="lg" variant="outline" className="rounded-full h-12 gap-2" asChild>
                  <a href={`tel:${master.phone}`}><Phone className="w-4 h-4" /> Позвонить</a>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-12 gap-2" asChild>
                  <a href={`https://wa.me/${master.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
