import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, ChevronRight, Home } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
}

export default function DashboardLayout({ children, title, navItems }: DashboardLayoutProps) {
  const { signOut, profile } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
            М
          </div>
          <span className="text-lg font-bold text-foreground">Мастер Час</span>
        </Link>
        {profile?.full_name && (
          <p className="text-sm text-muted-foreground mt-2 truncate">{profile.full_name}</p>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-auto">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-accent transition-colors text-sm"
        >
          <Home className="w-4 h-4" />
          <span>Главная</span>
        </Link>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-sm ${
                isActive(item.path)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {isActive(item.path) && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <Button variant="ghost" onClick={signOut} className="w-full justify-start gap-3 text-muted-foreground rounded-xl">
          <LogOut className="w-4 h-4" />
          {t("logout")}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 border-r border-border flex-col bg-card">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center px-4 gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
        </header>
        <main className="flex-1 p-3 md:p-6 overflow-auto pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
