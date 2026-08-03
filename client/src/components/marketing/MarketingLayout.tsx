import { Outlet } from "react-router-dom";
import { AnnouncementBar } from "@/components/marketing/AnnouncementBar";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { MobileStickyCta } from "@/components/marketing/MobileStickyCta";

export function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <AnnouncementBar />
      <SiteHeader />
      <main id="main-content" className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <SiteFooter />
      <MobileStickyCta />
    </div>
  );
}
