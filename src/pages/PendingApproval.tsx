import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Clock, LogOut } from "lucide-react";

export default function PendingApproval() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 mx-auto py-16 flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Заявка на рассмотрении</h2>
            <p className="text-muted-foreground mb-6">
              Ваша заявка мастера находится на рассмотрении. Мы уведомим вас по email, когда она будет одобрена.
            </p>
            <Button onClick={signOut} variant="outline" className="rounded-full gap-2">
              <LogOut className="w-4 h-4" />
              Выйти
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
