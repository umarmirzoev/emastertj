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
    setTimeout(() => navigate(getDashboardPath()), 0);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      let description = error.message;
      if (error.message.includes("Invalid login credentials")) {
        description = t("authWrongCredentials");
      } else if (error.message.includes("Email not confirmed")) {
        description = t("authEmailNotConfirmed");
      }
      toast({ title: t("authLoginError"), description, variant: "destructive" });
      setLoading(false);
      return;
    }
    let dashPath = "/dashboard";
    if (data.user) {
      const { data: rolesData } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      const userRoles = rolesData?.map(r => r.role) || [];
      if (userRoles.includes("super_admin")) dashPath = "/super-admin/dashboard";
      else if (userRoles.includes("admin")) dashPath = "/admin/dashboard";
      else if (userRoles.includes("master")) dashPath = "/master-dashboard";
    }
    setLoading(false);
    navigate(dashPath);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: t("error"), description: t("authPasswordMinLength"), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } else if (roleChoice === "master" && data.user) {
      setNewUserId(data.user.id);
      setMode("master_details");
    } else {
      navigate("/dashboard");
    }
  };

  const handleMasterComplete = () => { navigate("/pending-approval"); };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 mx-auto py-16 flex justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          {mode === "verify" ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">{t("authCheckEmail")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t("authEmailSent")} <span className="font-medium text-foreground">{email}</span>. {t("authFollowLink")}
                </p>
                <Button variant="outline" onClick={() => setMode("login")} className="rounded-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> {t("authBackToLogin")}
                </Button>
              </CardContent>
            </Card>
          ) : mode === "master_details" && newUserId ? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{t("authMasterDetails")}</CardTitle>
                <CardDescription>{t("authMasterDetailsDesc")}</CardDescription>
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
                  {mode === "login" ? t("authSignIn") : t("authRegistration")}
                </CardTitle>
                <CardDescription>
                  {mode === "login" ? t("authLoginToAccount") : t("authCreateAccount")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
                  {mode === "register" && (
                    <>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder={t("authYourName")} value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder={t("authPhone")} value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" type="tel" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button type="button" variant={roleChoice === "client" ? "default" : "outline"} onClick={() => setRoleChoice("client")} className="rounded-full">
                          {t("authClient")}
                        </Button>
                        <Button type="button" variant={roleChoice === "master" ? "default" : "outline"} onClick={() => setRoleChoice("master")} className="rounded-full">
                          {t("authMaster")}
                        </Button>
                      </div>
                    </>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder={t("authEmail")} value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" type="email" required />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder={t("authPassword")} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" type="password" required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full rounded-full h-12 text-base" disabled={loading}>
                    {loading ? "..." : mode === "login" ? t("authSignIn") : t("authRegister")}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-sm text-primary hover:underline">
                    {mode === "login" ? t("authNoAccountLink") : t("authHaveAccountLink")}
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
