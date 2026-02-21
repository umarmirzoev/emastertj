import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, Bell, User } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: Home, label: "Главная", path: "/" },
  { icon: ClipboardList, label: "Заказы", path: "/dashboard" },
  { icon: Bell, label: "Уведомления", path: "/dashboard" },
  { icon: User, label: "Профиль", path: "/dashboard" },
];

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications(user?.id);

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path && item.label !== "Уведомления";
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.label === "Уведомления" && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
