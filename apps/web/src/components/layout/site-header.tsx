import Link from "next/link";
import { Button } from "@/components/ui/button";
import { navigationContent } from "@/data/site-pages";

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link className="font-semibold tracking-tight" href="/">
          {navigationContent.brand}
        </Link>
        {/* On phones the links take their own row under the brand and button. */}
        <nav
          aria-label={navigationContent.label}
          className="order-last flex w-full flex-wrap gap-x-5 gap-y-1 md:order-none md:w-auto md:flex-1"
        >
          {navigationContent.links.map((link) => (
            <Link
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button asChild className="ml-auto md:ml-0" size="sm">
          <Link href={navigationContent.cta.href}>{navigationContent.cta.label}</Link>
        </Button>
      </div>
    </header>
  );
}
