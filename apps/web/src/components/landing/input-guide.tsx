import { inputGuideContent } from "@/data/site-pages";

// Side-by-side examples of a good and a bad floor-plan image.
export function InputGuide() {
  return (
    <article className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{inputGuideContent.title}</h1>
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {inputGuideContent.intro}
        </p>
      </header>
      <div className="mt-10 grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-2">
        {inputGuideContent.examples.map((example) => (
          <section className="bg-background p-5 sm:p-6" key={example.label}>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {example.label}
            </p>
            <h2 className="mt-2 text-xl font-medium tracking-tight">{example.title}</h2>
            <div className="mt-5 overflow-hidden rounded-md border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- static example image */}
              <img alt={example.alt} className="aspect-[4/3] w-full object-contain" src={example.image} />
            </div>
            <ul className="mt-5 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {example.points.map((point) => (
                <li className="flex gap-3" key={point}>
                  <span aria-hidden="true" className="font-mono text-foreground">
                    —
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-8 max-w-2xl border-l-2 border-foreground pl-4 text-sm leading-relaxed text-muted-foreground">
        {inputGuideContent.rule}
      </p>
    </article>
  );
}
