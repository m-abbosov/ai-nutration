import { cn } from "@nutriai/shared/lib/cn";
import { Outlet, useLocation } from "react-router-dom";

import { AppHeader } from "@/widgets/app-shell/app-header";
import { AppSidebar } from "@/widgets/app-sidebar/app-sidebar";
import { MobileBottomNav } from "@/widgets/mobile-bottom-nav/mobile-bottom-nav";

export function AppShell() {
  const location = useLocation();
  const isChat = location.pathname.startsWith("/chat");

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <main className="flex h-screen min-w-0 flex-1 flex-col">
        {/* The chat page ships its own compact header (title/status/menu); showing
         * the global greeting header too would waste scarce mobile height, so it's
         * hidden below the sidebar breakpoint for that route only. */}
        <div className={cn(isChat && "hidden md:block")}>
          <AppHeader />
        </div>
        <div className={cn("min-h-0 flex-1", isChat ? "overflow-hidden" : "overflow-y-auto")}>
          <Outlet />
        </div>
        <div className="flex-none md:hidden">
          <MobileBottomNav />
        </div>
      </main>
    </div>
  );
}
