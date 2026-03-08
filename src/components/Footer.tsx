import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Mail, MapPin, Crown, MessageCircle } from "lucide-react";

export const Footer = () => {
  const { t } = useLanguage();

  const districts = ["districtSino", "districtFirdausi", "districtShomansur", "districtIsmoili"];

  const navLinks = [
    { path: "/about", labelKey: "navAbout" },
    { path: "/categories", labelKey: "navCategories" },
    { path: "/how-it-works", labelKey: "navHowItWorks" },
    { path: "/contacts", labelKey: "navContacts" },
  ];

  const serviceLinks = [
    { path: "/become-master", labelKey: "footerBecomeMaster" },
  ];

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container px-4 mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center font-bold">
                М
              </div>
              <span className="text-xl font-bold">Мастер Час</span>
            </Link>
            <p className="text-background/60 text-sm leading-relaxed mb-4">
              {t("footerAboutText")}
            </p>
            <a
              href="https://wa.me/992900000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-full text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-background/40 mb-4">
              {t("navAbout")}
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-background/70 hover:text-background transition-colors text-sm">
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-background/40 mb-4">
              {t("footerServices")}
            </h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-background/70 hover:text-background transition-colors text-sm">
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
              <li>
                <span className="text-background/70 text-sm">{t("footerForBusiness")}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-background/40 mb-4">
              {t("footerContacts")}
            </h3>
            <div className="space-y-3">
              <a href="tel:+992900000000" className="flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm">
                <Phone className="w-4 h-4" />
                <span>+992 900 00 00 00</span>
              </a>
              <a href="mailto:support@masterchas.tj" className="flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm">
                <Mail className="w-4 h-4" />
                <span>support@masterchas.tj</span>
              </a>
              <span className="flex items-center gap-2 text-background/70 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Душанбе, Тоҷикистон</span>
              </span>
            </div>
            <h4 className="text-sm font-semibold text-background/40 mt-6 mb-3">{t("footerDistricts")}</h4>
            <div className="flex flex-wrap gap-2">
              {districts.map((district) => (
                <span key={district} className="text-xs text-background/40 bg-background/10 px-2 py-1 rounded">
                  {t(district)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/50">{t("footerRights")}</p>
          <div className="flex items-center gap-4 text-sm text-background/50">
            <a href="#" className="hover:text-background transition-colors">{t("footerPrivacy")}</a>
            <a href="#" className="hover:text-background transition-colors">{t("footerTerms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
