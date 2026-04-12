import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "dv" : "en")}
      className="gap-2"
    >
      <Languages className="w-4 h-4" />
      {language === "en" ? "ދިވެހި" : "English"}
    </Button>
  );
}