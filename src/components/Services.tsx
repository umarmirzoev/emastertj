import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Zap, Droplets, Paintbrush, Sofa, Hammer, Camera, Flame, Wrench, Home, Cpu, MoreHorizontal, ArrowRight,
} from "lucide-react";

interface ServicesProps {
  onOrderService: (serviceName: string, categoryKey: string) => void;
}

const serviceItems = [
  { key: "serviceElectric", icon: Zap, color: "from-amber-400 to-yellow-500" },
  { key: "servicePlumbing", icon: Droplets, color: "from-sky-400 to-blue-500" },
  { key: "serviceCleaning", icon: Paintbrush, color: "from-green-400 to-emerald-500" },
  { key: "serviceFurniture", icon: Sofa, color: "from-orange-400 to-amber-500" },
  { key: "serviceRenovation", icon: Hammer, color: "from-rose-400 to-red-500" },
  { key: "serviceSecurity", icon: Camera, color: "from-indigo-400 to-blue-500" },
  { key: "serviceWelding", icon: Flame, color: "from-red-400 to-orange-500" },
  { key: "serviceSmartHome", icon: Cpu, color: "from-violet-400 to-purple-500" },
  { key: "serviceRepair", icon: Wrench, color: "from-teal-400 to-cyan-500" },
  { key: "serviceTurnkey", icon: Home, color: "from-pink-400 to-rose-500" },
  { key: "serviceBasement", icon: Hammer, color: "from-slate-400 to-gray-500" },
  { key: "serviceOther", icon: MoreHorizontal, color: "from-gray-400 to-slate-500" },
];

export const Services = ({ onOrderService }: ServicesProps) => {
  const { t } = useLanguage();

  return (
    <div className="container px-4 mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {serviceItems.map((service) => {
          const Icon = service.icon;
          return (
            <Card
              key={service.key}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border"
            >
              <CardContent className="p-4 sm:p-5 text-center">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-3">{t(service.key)}</h3>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-full text-xs h-9"
                  onClick={() => onOrderService(t(service.key), service.key)}
                >
                  {t("categoryOrderButton")}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
