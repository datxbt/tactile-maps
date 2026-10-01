import { InfoPage } from "@/components/landing/info-page";
import { infoPages } from "@/data/site-pages";

export default function HowItWorksPage() {
  return <InfoPage steps={infoPages.howItWorks.steps} title={infoPages.howItWorks.title} />;
}
