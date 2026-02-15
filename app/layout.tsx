import type { Metadata } from "next";

import { SiteNav } from "@/components/site-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "GriefGrid++",
  description: "Real-time disaster survivor reunification powered by graph intelligence and explainable AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="app-body">
        <div className="app-shell">
          <header className="app-topbar">
            <div>
              <p className="brand-kicker">GriefGrid++</p>
              <h1 className="brand-title">Probabilistic Crisis Intelligence Engine</h1>
            </div>
            <SiteNav />
          </header>
          <main className="page-frame">{children}</main>
        </div>
      </body>
    </html>
  );
}
