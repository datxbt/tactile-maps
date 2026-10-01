import { ProjectList } from "@/components/home/project-list";
import { UploadCard } from "@/components/home/upload-card";
import { homeContent } from "@/data/content";

export default function MapsPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold tracking-tight">{homeContent.heading}</h1>
        <p className="text-muted-foreground">{homeContent.subheading}</p>
      </header>
      <UploadCard />
      <ProjectList />
    </main>
  );
}
