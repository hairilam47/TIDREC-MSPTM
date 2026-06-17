import React from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useGetMe, useGetAnnouncements, useLogout } from "@workspace/api-client-react";

export default function PortalLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [location] = useLocation();
  const [rail, setRail] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { data: user } = useGetMe();
  const { data: announcements } = useGetAnnouncements();
  const logoutMutation = useLogout();

  const importantCount = announcements?.filter((a) => a.important).length ?? 0;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("satbds_token");
        window.location.href = "/login";
      },
    });
  };

  const navGroups = [
    {
      label: "Main",
      items: [
        { href: "/portal", label: "Dashboard", icon: <IcoDash /> },
        { href: "/portal/registration", label: "My Registration", icon: <IcoClipboard /> },
        { href: "/portal/abstracts", label: "My Abstracts", icon: <IcoDoc /> },
        { href: "/portal/invoices", label: "Invoices", icon: <IcoReceipt /> },
      ],
    },
    {
      label: "Conference",
      items: [
        { href: "/portal/programme", label: "Programme", icon: <IcoCal /> },
        { href: "/portal/speakers", label: "Speakers", icon: <IcoUsers /> },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/portal/profile", label: "Profile", icon: <IcoProfile /> },
        {
          href: "/portal/notifications",
          label: "Notifications",
          icon: <IcoBell />,
          badge: importantCount > 0 ? importantCount : undefined,
        },
        { href: "/portal/support", label: "Support", icon: <IcoHelp /> },
      ],
    },
  ];

  const isActive = (href: string) =>
    href === "/portal" ? location === "/portal" : location.startsWith(href);

  const activeLabel =
    title ||
    navGroups.flatMap((g) => g.items).find((i) => isActive(i.href))?.label ||
    "Portal";

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "Delegate";

  const onToggle = () => {
    if (window.innerWidth >= 769) setRail((r) => !r);
    else setMobileOpen((o) => !o);
  };

  return (
    <div
      className={rail ? "g4-shell g4-portal g4-rail" : "g4-shell g4-portal"}
      style={{ minHeight: "100vh", background: "var(--body-bg)" }}
    >
      {/* ── Sidebar ── */}
      <aside className={mobileOpen ? "g4-sidebar mobile-open" : "g4-sidebar"}>
        <div className="g4-sidebar-brand">
          <div className="g4-brand-icon">S</div>
          <div className="g4-brand-name">SATBDS <small>2027</small></div>
        </div>

        <nav className="g4-sidebar-nav" aria-label="Portal navigation">
          {navGroups.map((group) => (
            <div className="g4-nav-group" key={group.label}>
              <div className="g4-nav-label">{group.label}</div>
              {group.items.map((item) => {
                const active = isActive(item.href);
                const badge = (item as { badge?: number }).badge;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={active ? "g4-nav-link active" : "g4-nav-link"}
                    data-label={item.label}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.icon}
                    <span className="g4-nav-text">{item.label}</span>
                    {badge ? (
                      <span className="g4-badge g4-badge-teal">{badge}</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="g4-sidebar-footer">
          <div className="g4-sidebar-user" title={fullName}>
            <div className="g4-user-avatar">{initials}</div>
            <div className="g4-user-info">
              <div className="g4-user-name">{fullName}</div>
              <div className="g4-user-role">Delegate</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="g4-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Topbar ── */}
      <header className="g4-topbar">
        <div className="g4-topbar-left">
          <button className="g4-sidebar-toggle" type="button" aria-label="Toggle sidebar" onClick={onToggle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <nav className="g4-breadcrumb" aria-label="Breadcrumb">
            <span>Portal</span>
            <span className="sep" aria-hidden="true">›</span>
            <span className="current">{activeLabel}</span>
          </nav>
        </div>

        <div className="g4-search-box">
          <span className="g4-search-icon">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" />
            </svg>
          </span>
          <input type="text" placeholder="Search…" aria-label="Search" readOnly />
        </div>

        <div className="g4-topbar-right">
          <Link href="/portal/notifications">
            <button
              className="g4-tb-btn"
              type="button"
              title="Notifications"
              aria-label="Notifications"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 3a6 6 0 00-6 6c0 6-3 7-3 7h18s-3-1-3-7a6 6 0 00-6-6z"/>
                <path d="M10.5 21a1.5 1.5 0 003 0"/>
              </svg>
              {importantCount > 0 && (
                <span className="g4-tb-badge">{importantCount > 9 ? "9+" : importantCount}</span>
              )}
            </button>
          </Link>

          <button
            className="g4-tb-btn"
            type="button"
            title="Sign out"
            onClick={handleLogout}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>

          <button className="g4-tb-avatar" type="button" title={fullName}>{initials}</button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="g4-main" id="main-content">
        <div className="g4-page-wrapper">
          <div className="g4-page-header">
            <div className="g4-page-header-row">
              <div>
                <div className="g4-page-pretitle">SATBDS 2027 Delegate Portal</div>
                <h1 className="g4-page-title">{activeLabel}</h1>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/* ── Icons ── */
const IcoDash = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="4" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="10" width="7" height="11" rx="1.5"/>
  </svg>
);
const IcoClipboard = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>
  </svg>
);
const IcoDoc = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IcoReceipt = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M5 21V3h14v18l-3-2-3 2-3-2-3 2-2-2z"/><path d="M9 8h6M9 12h6M9 16h4"/>
  </svg>
);
const IcoCal = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2"/>
    <path d="M3 10h18M8 4v6M16 4v6"/>
  </svg>
);
const IcoUsers = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IcoProfile = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IcoBell = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M12 3a6 6 0 00-6 6c0 6-3 7-3 7h18s-3-1-3-7a6 6 0 00-6-6z"/>
    <path d="M10.5 21a1.5 1.5 0 003 0"/>
  </svg>
);
const IcoHelp = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3"/>
    <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
  </svg>
);
