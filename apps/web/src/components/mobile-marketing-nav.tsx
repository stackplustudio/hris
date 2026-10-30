"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function MobileMarketingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="hris-marketing-menu md:hidden">
      <button
        ref={triggerRef}
        aria-controls="mobile-site-navigation"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Tutup navigasi" : "Buka navigasi utama"}
        className="hris-marketing-menu-toggle"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {isOpen ? (
          <X aria-hidden="true" size={20} />
        ) : (
          <Menu aria-hidden="true" size={20} />
        )}
      </button>
      {isOpen && (
        <div
          aria-label="Navigasi seluler"
          className="hris-marketing-menu-panel"
          id="mobile-site-navigation"
          role="navigation"
        >
          <a href="#features" onClick={closeMenu}>
            Fitur
          </a>
          <a href="#pricing" onClick={closeMenu}>
            Harga
          </a>
          <a href="#about" onClick={closeMenu}>
            Tentang Kami
          </a>
          <Link href="/login" onClick={closeMenu}>
            Masuk
          </Link>
        </div>
      )}
    </div>
  );
}
