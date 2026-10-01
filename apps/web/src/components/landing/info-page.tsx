type InfoPageProps = {
  title: string;
  paragraphs?: readonly string[];
  steps?: readonly { title: string; description: string }[];
};

// Shared layout for the text pages: a title, then paragraphs or numbered steps.
export function InfoPage({ title, paragraphs, steps }: InfoPageProps) {
  return (
    <article className="mx-auto max-w-xl px-4 py-16 sm:py-24">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      {paragraphs?.map((paragraph) => (
        <p className="mt-6 text-pretty text-base leading-relaxed text-muted-foreground" key={paragraph}>
          {paragraph}
        </p>
      ))}
      {steps && (
        <ol className="mt-10 space-y-8">
          {steps.map((step, index) => (
            <li className="flex gap-5" key={step.title}>
              <span className="font-mono text-sm leading-6 text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-base font-medium leading-6">{step.title}</h2>
                <p className="mt-1 text-pretty text-base leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
