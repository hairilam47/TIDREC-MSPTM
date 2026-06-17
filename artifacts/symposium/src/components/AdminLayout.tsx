import React from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useGetMe, useLogout } from "@workspace/api-client-react";

export default function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [location] = useLocation();
  const [rail, setRail] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { data: user } = useGetMe();
  const logoutMutation = useLogout();

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
      label: "Overview",
      items: [
        { href: "/admin", label: "Dashboard", icon: <IcoDash /> },
        { href: "/admin/analytics", label: "Analytics", icon: <IcoAnalytics /> },
        { href: "/admin/reports", label: "Reports", icon: <IcoReports /> },
      ],
    },
    {
      label: "Management",
      items: [
        { href: "/admin/registrations", label: "Registrations", icon: <IcoUsers /> },
        { href: "/admin/payments", label: "Payments", icon: <IcoCard /> },
        { href: "/admin/invoices", label: "Invoices", icon: <IcoReceipt /> },
        { href: "/admin/abstracts", label: "Abstracts", icon: <IcoDoc /> },
        { href: "/admin/speakers", label: "Speakers", icon: <IcoMic /> },
        { href: "/admin/programme", label: "Programme", icon: <IcoCal /> },
        { href: "/admin/sponsors", label: "Sponsors", icon: <IcoStar /> },
      ],
    },
    {
      label: "Administration",
      items: [
        { href: "/admin/users", label: "Users", icon: <IcoTeam /> },
        { href: "/admin/announcements", label: "Announcements", icon: <IcoBell /> },
        { href: "/admin/emails", label: "Emails", icon: <IcoMail /> },
        { href: "/admin/settings", label: "Settings", icon: <IcoSettings /> },
      ],
    },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? location === "/admin" : location.startsWith(href);

  const activeLabel =
    title ||
    navGroups.flatMap((g) => g.items).find((i) => isActive(i.href))?.label ||
    "Admin";

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "A";

  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "Administrator";

  const onToggle = () => {
    if (window.innerWidth >= 769) setRail((r) => !r);
    else setMobileOpen((o) => !o);
  };

  return (
    <div
      className={rail ? "g4-shell g4-rail" : "g4-shell"}
      style={{ minHeight: "100vh", background: "var(--body-bg)" }}
    >
      {/* ── Sidebar ── */}
      <aside className={mobileOpen ? "g4-sidebar mobile-open" : "g4-sidebar"}>
        <div className="g4-sidebar-brand">
          <div className="g4-brand-icon">S</div>
          <div className="g4-brand-name">SATBDS <small>2027</small></div>
        </div>

        <nav className="g4-sidebar-nav" aria-label="Admin navigation">
          {navGroups.map((group) => (
            <div className="g4-nav-group" key={group.label}>
              <div className="g4-nav-label">{group.label}</div>
              {group.items.map((item) => {
                const active = isActive(item.href);
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
              <div className="g4-user-role">Administrator</div>
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
            <span>Admin</span>
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
          <a
            href="/portal/"
            className="g4-tb-btn"
            title="Delegate view"
            style={{ width: "auto", padding: "0 10px", fontSize: 12, gap: 5, textDecoration: "none", color: "var(--text-secondary)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Delegate
          </a>

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
                <div className="g4-page-pretitle">SATBDS 2027 Admin</div>
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
const IcoAnalytics = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M4 19V5M8 19v-8M12 19V9M16 19v-5M20 19v-9"/>
  </svg>
);
const IcoReports = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>
  </svg>
);
const IcoUsers = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IcoCard = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
  </svg>
);
const IcoReceipt = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M5 21V3h14v18l-3-2-3 2-3-2-3 2-2-2z"/><path d="M9 8h6M9 12h6M9 16h4"/>
  </svg>
);
const IcoDoc = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IcoMic = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
    <path d="M19 10v2a7 7 0 01-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const IcoCal = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2"/>
    <path d="M3 10h18M8 4v6M16 4v6"/>
  </svg>
);
const IcoStar = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcoTeam = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IcoBell = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M12 3a6 6 0 00-6 6c0 6-3 7-3 7h18s-3-1-3-7a6 6 0 00-6-6z"/>
    <path d="M10.5 21a1.5 1.5 0 003 0"/>
  </svg>
);
const IcoMail = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 6 10-6"/>
  </svg>
);
const IcoSettings = () => (
  <svg className="g4-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
  </svg>
);
