import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Clock, LogOut } from "lucide-react";

export default function PendingApproval() {
  const { signOut } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 mx-auto py-16 flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">{t("pendingTitle")}</h2>
            <p className="text-muted-foreground mb-6">{t("pendingDesc")}</p>
            <Button onClick={signOut} variant="outline" className="rounded-full gap-2">
              <LogOut className="w-4 h-4" /> {t("logout")}
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
