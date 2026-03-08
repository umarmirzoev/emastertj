import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LogIn, UserPlus, Mail, Lock, User, Phone, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MasterRegistrationFields from "@/components/dashboard/MasterRegistrationFields";

type AuthMode = "login" | "register" | "verify" | "master_details";
type RoleChoice = "client" | "master";

const Auth = () => {
  const { t } = useLanguage();
  const { user, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [roleChoice, setRoleChoice] = useState<RoleChoice>("client");
  const [newUserId, setNewUserId] = useState<string | null>(null);

  if (user && !loading && mode !== "master_details") {
    setTimeout(() => navigate("/dashboard"), 0);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    console.log("[Auth] Attempting login for:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error("[Auth] Login error:", error.message, error.status);
      
      let description = error.message;
      if (error.message.includes("Invalid login credentials")) {
        description = "Неверный email или пароль. Проверьте данные и попробуйте снова.";
      } else if (error.message.includes("Email not confirmed")) {
        description = "Email не подтверждён. Проверьте почту для подтверждения.";
      }
      
      toast({ title: "Ошибка входа", description, variant: "destructive" });
      setLoading(false);
      return;
    }
    
    console.log("[Auth] Login successful, user:", data.user?.id);
    console.log("[Auth] Session created:", !!data.session);
    
    // Fetch roles to log
    if (data.user) {
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      console.log("[Auth] User roles:", rolesData?.map(r => r.role));
    }
    
    setLoading(false);
    navigate("/dashboard");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Ошибка", description: "Пароль должен быть не менее 6 символов", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else if (roleChoice === "master" && data.user) {
      setNewUserId(data.user.id);
      setMode("master_details");
    } else {
      navigate("/dashboard");
    }
  };

  const handleMasterComplete = () => {
    navigate("/pending-approval");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 mx-auto py-16 flex justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          {mode === "verify" ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Проверьте почту</h2>
                <p className="text-muted-foreground mb-6">
                  Мы отправили письмо на <span className="font-medium text-foreground">{email}</span>. Перейдите по ссылке для подтверждения.
                </p>
                <Button variant="outline" onClick={() => setMode("login")} className="rounded-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Вернуться к входу
                </Button>
              </CardContent>
            </Card>
          ) : mode === "master_details" && newUserId ? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Данные мастера</CardTitle>
                <CardDescription>Заполните информацию о вашей специализации</CardDescription>
              </CardHeader>
              <CardContent>
                <MasterRegistrationFields userId={newUserId} onComplete={handleMasterComplete} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
                  {mode === "login" ? <LogIn className="w-7 h-7 text-white" /> : <UserPlus className="w-7 h-7 text-white" />}
                </div>
                <CardTitle className="text-2xl">
                  {mode === "login" ? t("login") : "Регистрация"}
                </CardTitle>
                <CardDescription>
                  {mode === "login" ? "Войдите в свой аккаунт" : "Создайте новый аккаунт"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
                  {mode === "register" && (
                    <>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Ваше имя" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" type="tel" />
                      </div>
                      {/* Role choice */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={roleChoice === "client" ? "default" : "outline"}
                          onClick={() => setRoleChoice("client")}
                          className="rounded-full"
                        >
                          Клиент
                        </Button>
                        <Button
                          type="button"
                          variant={roleChoice === "master" ? "default" : "outline"}
                          onClick={() => setRoleChoice("master")}
                          className="rounded-full"
                        >
                          Мастер
                        </Button>
                      </div>
                    </>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" type="email" required />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" type="password" required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full rounded-full h-12 text-base" disabled={loading}>
                    {loading ? "..." : mode === "login" ? t("login") : "Зарегистрироваться"}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                    className="text-sm text-primary hover:underline"
                  >
                    {mode === "login" ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
