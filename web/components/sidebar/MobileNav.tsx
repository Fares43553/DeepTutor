"use client";

import { useState, useEffect } from "react";
import WorkspaceSidebar from "./WorkspaceSidebar";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer when the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div className="md:hidden flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-4 shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <Image
              src="/logo-ver2.png"
              alt="DeepTutor"
              width={22}
              height={22}
            />
            <span className="text-[16px] font-semibold leading-none tracking-[-0.02em] text-[var(--foreground)]">
              DeepTutor
            </span>
          </Link>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-md text-[var(--foreground)] hover:bg-[var(--secondary)]"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Drawer */}
          <div className="relative flex w-[260px] max-w-[80vw] flex-col bg-[var(--secondary)] shadow-xl animate-fade-in-right h-full overflow-y-auto">
            <div className="flex items-center justify-between h-14 px-4 sticky top-0 bg-[var(--secondary)] z-10 border-b border-[var(--border)]/10">
               <span className="font-semibold text-sm">Navigation</span>
               <button
                onClick={() => setIsOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* 
              Force WorkspaceSidebar to be static instead of fixed/screen height if needed, 
              but since it uses h-screen it will fit perfectly in this fixed drawer screen constraint.
            */}
            <div className="flex-1 overflow-y-auto">
                <WorkspaceSidebar />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
