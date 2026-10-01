import { footerContent } from "@/data/site-pages";

export function SiteFooter() {
  return (
    <footer className="border-t py-6 text-center text-xs text-muted-foreground">
      {footerContent.text}
    </footer>
  );
}
