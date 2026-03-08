import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Languages,
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Building2,
  HelpCircle,
  Phone,
  UserPlus,
  Wrench,
  LayoutDashboard,
  User,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, signOut, loading, getDashboardPath } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/about", labelKey: "navAbout", icon: Building2 },
    { path: "/categories", labelKey: "navCategories", icon: Wrench },
    { path: "/masters", labelKey: "navMasters", icon: User },
    { path: "/shop", label: "Магазин", icon: ShoppingBag },
    { path: "/services", labelKey: "servicesTitle", icon: Wrench },
    { path: "/how-it-works", labelKey: "navHowItWorks", icon: HelpCircle },
    { path: "/contacts", labelKey: "navContacts", icon: Phone },
    { path: "/become-master", labelKey: "navBecomeMaster", icon: UserPlus },
  ];

  const getLanguageLabel = () => {
    switch (language) {
      case "ru": return "RU";
      case "tj": return "TJ";
      case "en": return "EN";
      default: return "RU";
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
              М
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              Мастер Час
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item: any) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {item.label || t(item.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">{itemCount}</span>
                )}
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 rounded-full px-3">
                  <Languages className="w-4 h-4" />
                  <span className="text-sm font-medium">{getLanguageLabel()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px]">
                <DropdownMenuItem onClick={() => setLanguage("ru")} className="cursor-pointer">🇷🇺 Русский</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("tj")} className="cursor-pointer">🇹🇯 Тоҷикӣ</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")} className="cursor-pointer">🇬🇧 English</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:flex items-center gap-2">
              {!loading && user ? (
                <>
                  <NotificationBell />
                  <Button onClick={() => navigate(getDashboardPath())} size="sm" variant="ghost" className="rounded-full gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    {t("cabinet")}
                  </Button>
                  <Button onClick={signOut} size="sm" variant="outline" className="rounded-full gap-2">
                    <LogOut className="w-4 h-4" />
                    {t("logout")}
                  </Button>
                </>
              ) : !loading ? (
                <Button onClick={() => navigate("/auth")} size="sm" className="rounded-full gap-2 px-4">
                  <LogIn className="w-4 h-4" />
                  {t("login")}
                </Button>
              ) : null}
            </div>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-full">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground font-bold">М</div>
                        <span className="text-lg font-bold text-foreground">Мастер Час</span>
                      </div>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="rounded-full"><X className="w-5 h-5" /></Button>
                      </SheetClose>
                    </div>
                    {user && profile?.full_name && (
                      <p className="text-sm text-muted-foreground mt-2">{profile.full_name}</p>
                    )}
                  </div>
                  <nav className="flex-1 p-4 space-y-1 overflow-auto">
                    {user && (
                      <SheetClose asChild>
                        <Link to={getDashboardPath()} className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary/10 text-primary mb-2">
                          <div className="flex items-center gap-3">
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="font-medium">{t("cabinet")}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-50" />
                        </Link>
                      </SheetClose>
                    )}
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SheetClose asChild key={item.path}>
                          <Link
                            to={item.path}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                              isActive(item.path) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5" />
                              <span className="font-medium">{(item as any).label || t((item as any).labelKey)}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-50" />
                          </Link>
                        </SheetClose>
                      );
                    })}
                    <div className="pt-4 border-t border-border mt-4">
                      {user ? (
                        <SheetClose asChild>
                          <button
                            onClick={signOut}
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full border border-destructive/30 text-destructive font-medium hover:bg-destructive/10 transition-colors"
                          >
                            <LogOut className="w-5 h-5" />
                            {t("logout")}
                          </button>
                        </SheetClose>
                      ) : (
                        <SheetClose asChild>
                          <Link
                            to="/auth"
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                          >
                            <LogIn className="w-5 h-5" />
                            {t("login")}
                          </Link>
                        </SheetClose>
                      )}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
