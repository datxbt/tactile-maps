import { GalleryEntry } from "@/components/landing/gallery-entry";
import { galleryContent } from "@/data/site-pages";

export default function GalleryPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{galleryContent.title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{galleryContent.intro}</p>
      <div className="mt-10 flex flex-col gap-14">
        {galleryContent.entries.map((entry) => (
          <GalleryEntry entry={entry} key={entry.slug} />
        ))}
      </div>
    </section>
  );
}
