import { motion } from "framer-motion";
import { Shield, Zap, ThumbsUp, Award } from "lucide-react";

const badges = [
  { icon: Shield, label: "Проверенный мастер", color: "text-primary" },
  { icon: Award, label: "Документы проверены", color: "text-amber-500" },
  { icon: Zap, label: "Быстрый ответ", color: "text-blue-500" },
  { icon: ThumbsUp, label: "Гарантия сервиса", color: "text-emerald-500" },
];

export default function MasterTrust() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {badges.map((b) => (
        <div key={b.label} className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/50 shadow-sm">
          <b.icon className={`w-5 h-5 ${b.color} shrink-0`} />
          <span className="text-xs sm:text-sm font-medium text-foreground">{b.label}</span>
        </div>
      ))}
    </motion.div>
  );
}
