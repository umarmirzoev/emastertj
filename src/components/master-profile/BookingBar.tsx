import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface Props {
  master: any;
  onBook: () => void;
}

export default function MasterBookingBar({ master, onBook }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-bottom">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-foreground">
            аз {master.price_min || 50} <span className="text-sm font-normal text-muted-foreground">сомонӣ</span>
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{master.average_rating || "5.0"}</span>
            <span>· {master.total_reviews || 0} отзывов</span>
          </div>
        </div>
        <Button
          size="lg"
          className="rounded-full h-11 px-6 font-semibold bg-gradient-to-r from-primary to-emerald-500 shadow-lg"
          onClick={onBook}
        >
          Заказать
        </Button>
      </div>
    </div>
  );
}
