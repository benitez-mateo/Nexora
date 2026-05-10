"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Toast } from "@/components/primitives/Toast";
import { useMediaQuery, BREAKPOINT } from "@/lib/use-media-query";
import { useWorkspace } from "@/lib/workspace-context";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function NavShell({ children }: { children: React.ReactNode }) {
  const { chatOpen, toast, currentProject } = useWorkspace();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isDesktop = useMediaQuery(BREAKPOINT.lg);
  const pathname = usePathname();

  const onProjectRoute = /^\/proyectos\/[^/]+$/.test(pathname);
  const showChat = onProjectRoute && currentProject !== null;
  const mainMarginRight = showChat && isDesktop && chatOpen ? 408 : 0;

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="relative z-[1] min-h-screen flex">
        <Sidebar
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
        <main
          className="flex-1 px-4 sm:px-8 lg:px-12 min-w-0 transition-[margin-right] duration-300 ease-out"
          style={{
            marginRight: mainMarginRight,
            paddingTop: "calc(env(safe-area-inset-top) + 24px)",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 80px)",
          }}
        >
          <Header onOpenDrawer={() => setDrawerOpen(true)} />
          {children}
        </main>
      </div>
      {showChat && <ChatPanel />}
      <Toast message={toast} />
    </>
  );
}
