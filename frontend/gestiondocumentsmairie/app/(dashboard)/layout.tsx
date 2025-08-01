import Sidebar from "@/components/sidebar";
import SiteHeader from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { ReactNode } from "react";

export default function DashboardPagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <SiteHeader />
          <main className="flex-1 p-4 bg-slate-50 dark:bg-slate-950">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}