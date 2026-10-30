'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Menu, X, type LucideIcon } from 'lucide-react';

export type DashboardNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type DashboardNavigationGroup = {
  label?: string;
  items: DashboardNavigationItem[];
};

type DashboardShellProps = {
  children: React.ReactNode;
  groups: DashboardNavigationGroup[];
  onLogout: () => void;
  userName: string;
};

export default function DashboardShell({
  children,
  groups,
  onLogout,
  userName,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isMobileNavOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileNavOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileNavOpen]);

  const currentItem = groups.flatMap((group) => group.items).find((item) => {
    if (item.href === '/admin' || item.href === '/employee') {
      return pathname === item.href;
    }

    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="hris-shell">
      {isMobileNavOpen && (
        <button
          aria-label="Tutup navigasi"
          className="hris-scrim"
          onClick={() => setIsMobileNavOpen(false)}
          type="button"
        />
      )}

      <aside
        aria-label="Navigasi utama"
        className={`hris-sidebar${isMobileNavOpen ? ' is-open' : ''}`}
      >
        <div className="hris-brand">
          <Image
            alt="StackPlus Studio"
            height={32}
            priority
            src="/logo.png"
            width={64}
          />
        </div>

        <nav aria-label="Navigasi ruang kerja" className="hris-nav" id="primary-navigation">
          {groups.map((group, groupIndex) => (
            <div className="hris-nav-group" key={group.label ?? `group-${groupIndex}`}>
              {group.label && <p className="hris-nav-label">{group.label}</p>}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin' &&
                    item.href !== '/employee' &&
                    pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    aria-current={isActive ? 'page' : undefined}
                    className="hris-nav-link"
                    href={item.href}
                    key={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="hris-sidebar-footer">
          <button className="hris-logout" onClick={onLogout} type="button">
            <LogOut aria-hidden="true" size={20} strokeWidth={1.8} />
            <span>Keluar akun</span>
          </button>
        </div>
      </aside>

      <div className="hris-main">
        <header className="hris-topbar">
          <div className="flex items-center gap-3">
            <button
              aria-controls="primary-navigation"
              aria-expanded={isMobileNavOpen}
              aria-label={isMobileNavOpen ? 'Tutup menu' : 'Buka menu'}
              className="hris-menu-toggle"
              onClick={() => setIsMobileNavOpen((isOpen) => !isOpen)}
              type="button"
            >
              {isMobileNavOpen ? (
                <X aria-hidden="true" size={20} />
              ) : (
                <Menu aria-hidden="true" size={20} />
              )}
            </button>
            <p className="hris-topbar-title">{currentItem?.label ?? 'Ruang kerja'}</p>
          </div>

          <div className="hris-topbar-meta">
            <time>
              {new Intl.DateTimeFormat('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                timeZone: 'Asia/Jakarta',
              }).format(new Date())}
            </time>
            <div className="hris-user">
              <span aria-hidden="true" className="hris-user-avatar">
                {initials || 'HR'}
              </span>
              <span className="hris-user-name">{userName}</span>
            </div>
          </div>
        </header>

        <main className="hris-workspace">{children}</main>
      </div>
    </div>
  );
}
