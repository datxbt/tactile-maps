import Link from "next/link";
import { Button } from "@/components/ui/button";
import { landingContent } from "@/data/site-pages";

export function LandingHero() {
  const { compliance } = landingContent;
  return (
    <section className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">{landingContent.heading}</h1>
      <p className="mt-5 text-xl font-medium tracking-tight sm:text-2xl">{landingContent.subheading}</p>
      <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
        {landingContent.tagline}
      </p>
      <Button asChild className="mt-8 h-11 px-6 text-base" size="lg">
        <Link href={landingContent.ctaHref}>{landingContent.cta}</Link>
      </Button>
      <Link
        className="mt-4 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        href={landingContent.guideHref}
      >
        {landingContent.guideLabel}
      </Link>
      <p className="mt-12 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
        {compliance.lead}{" "}
        {compliance.standards.map((standard, index) => (
          <span key={standard.name}>
            {index > 0 && compliance.joiner}
            <a
              className="whitespace-nowrap font-mono text-foreground underline decoration-muted-foreground/50 underline-offset-4 hover:decoration-foreground"
              href={standard.href}
              rel="noopener noreferrer"
              target="_blank"
              title={standard.fullName}
            >
              {standard.name}
            </a>
          </span>
        ))}
        {compliance.tail}
      </p>
    </section>
  );
}
