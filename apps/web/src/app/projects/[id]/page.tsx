import { ProjectWorkspace } from "@/components/project/project-workspace";

export default async function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  return <ProjectWorkspace id={id} />;
}
