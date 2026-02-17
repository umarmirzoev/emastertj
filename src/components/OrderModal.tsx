import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string | null;
  initialServiceName?: string;
}

export default function OrderModal({ isOpen, onClose, category, initialServiceName }: OrderModalProps) {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [district, setDistrict] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setPhone("");
      setComment("");
      setDistrict("");
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("orderModalTitle")}</DialogTitle>
          <DialogDescription>{t("orderModalDesc")}</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-center font-medium text-foreground">{t("orderModalSuccess")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder={t("formName")} value={name} onChange={(e) => setName(e.target.value)} required />
            <Input placeholder={t("formPhone")} value={phone} onChange={(e) => setPhone(e.target.value)} required type="tel" />
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger>
                <SelectValue placeholder={t("formDistrict")} />
              </SelectTrigger>
              <SelectContent>
                {["districtSino", "districtFirdausi", "districtShomansur", "districtIsmoili"].map((d) => (
                  <SelectItem key={d} value={d}>{t(d)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea placeholder={t("formComment")} value={comment} onChange={(e) => setComment(e.target.value)} />
            <Button type="submit" className="w-full rounded-full">{t("orderModalSubmit")}</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
