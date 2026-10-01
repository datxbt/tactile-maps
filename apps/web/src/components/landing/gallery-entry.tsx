import { DownloadIcon } from "lucide-react";
import { PlateViewer } from "@/components/preview/plate-viewer";
import { Button } from "@/components/ui/button";
import { galleryContent, type GalleryItem } from "@/data/site-pages";

type GalleryEntryProps = {
  entry: GalleryItem;
};

// One example: the uploaded plan next to the interactive 3D plate.
export function GalleryEntry({ entry }: GalleryEntryProps) {
  return (
    <article>
      <h2 className="text-base font-medium">{entry.title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{entry.description}</p>
      <div className="mt-4 grid grid-cols-1 divide-y overflow-hidden rounded-lg border md:grid-cols-2 md:divide-x md:divide-y-0">
        <figure>
          <figcaption className="border-b px-3 py-2 text-xs text-muted-foreground">
            {galleryContent.sourceLabel}
          </figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element -- static example image */}
          <img
            alt={`${entry.title}: ${galleryContent.sourceLabel}`}
            className="aspect-square w-full bg-white object-contain"
            src={entry.source}
          />
        </figure>
        <figure>
          <figcaption className="flex items-center justify-between gap-3 border-b px-3 py-1.5 text-xs text-muted-foreground">
            <span>{galleryContent.stlLabel}</span>
            <Button asChild size="xs" variant="outline">
              <a download={`${entry.slug}.stl`} href={entry.stl}>
                <DownloadIcon data-icon="inline-start" />
                {galleryContent.downloadLabel}
              </a>
            </Button>
          </figcaption>
          <div className="p-2">
            <PlateViewer src={entry.stl} />
          </div>
        </figure>
      </div>
    </article>
  );
}
