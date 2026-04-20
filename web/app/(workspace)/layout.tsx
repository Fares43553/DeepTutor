import WorkspaceSidebar from "@/components/sidebar/WorkspaceSidebar";
import MobileNav from "@/components/sidebar/MobileNav";
import { UnifiedChatProvider } from "@/context/UnifiedChatContext";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UnifiedChatProvider>
      <div className="flex h-screen flex-col md:flex-row overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <MobileNav />
        
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <div className="hidden md:flex h-full shrink-0">
          <WorkspaceSidebar />
        </div>
        
        <main className="flex-1 overflow-hidden bg-[var(--background)] flex flex-col">{children}</main>
      </div>
    </UnifiedChatProvider>
  );
}
