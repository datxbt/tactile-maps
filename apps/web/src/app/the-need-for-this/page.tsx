import { InfoPage } from "@/components/landing/info-page";
import { infoPages } from "@/data/site-pages";

export default function TheNeedPage() {
  return <InfoPage paragraphs={infoPages.theNeed.paragraphs} title={infoPages.theNeed.title} />;
}
