import type { Metadata } from "next";
import "./globals.css";
import { DM_Mono, Doto } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteContent } from "@/data/site";
import { cn } from "@/lib/utils";

const dmMono = DM_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
});

const doto = Doto({
  axes: ["ROND"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-doto",
});

export const metadata: Metadata = {
  title: siteContent.title,
  description: siteContent.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={cn(
        "font-sans antialiased",
        GeistSans.variable,
        dmMono.variable,
        doto.variable
      )}
    >
      <body className="flex min-h-svh flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
