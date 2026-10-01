import { InfoPage } from "@/components/landing/info-page";
import { infoPages } from "@/data/site-pages";

export default function WhatItDoesPage() {
  return <InfoPage paragraphs={infoPages.whatItDoes.paragraphs} title={infoPages.whatItDoes.title} />;
}
