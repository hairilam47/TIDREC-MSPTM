import React from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useGetMe, useGetAnnouncements, useLogout } from "@workspace/api-client-react";

const NAV_GROUPS = [
  {
    section: "Main",
    items: [
      { key: "dashboard",    href: "/portal",               label: "Dashboard",       icon: <IcoDash /> },
      { key: "registration", href: "/portal/registration",  label: "My Registration", icon: <IcoClipboard /> },
      { key: "abstracts",    href: "/portal/abstracts",     label: "My Abstracts",    icon: <IcoDoc /> },
      { key: "invoices",     href: "/portal/invoices",      label: "Invoices",        icon: <IcoReceipt /> },
    ],
  },
  {
    section: "Conference",
    items: [
      { key: "programme", href: "/portal/programme", label: "Programme", icon: <IcoCal /> },
      { key: "speakers",  href: "/portal/speakers",  label: "Speakers",  icon: <IcoUsers /> },
    ],
  },
  {
    section: "Account",
    items: [
      { key: "profile",       href: "/portal/profile",       label: "Profile",       icon: <IcoProfile /> },
      { key: "notifications", href: "/portal/notifications", label: "Notifications", icon: <IcoBell /> },
      { key: "support",       href: "/portal/support",       label: "Support",       icon: <IcoHelp /> },
    ],
  },
];

export default function PortalLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [location] = useLocation();
  const [rail, setRail]             = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [theme, setTheme]           = React.useState<"light" | "dark">("light");
  const [avatarOpen, setAvatarOpen] = React.useState(false);
  const avatarRef = React.useRef<HTMLDivElement>(null);

  const { data: user }          = useGetMe();
  const { data: announcements } = useGetAnnouncements();
  const logoutMutation          = useLogout();

  const unreadCount = announcements?.filter((a) => a.important).length ?? 0;

  /* ── Click-outside for avatar dropdown ── */
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    if (avatarOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [avatarOpen]);

  /* ── body.data-shell = "portal" + rail / open body classes ── */
  React.useEffect(() => {
    document.body.dataset.shell = "portal";
    return () => { delete document.body.dataset.shell; };
  }, []);
  React.useEffect(() => {
    document.body.classList.toggle("sidebar-rail", rail);
    return () => { document.body.classList.remove("sidebar-rail"); };
  }, [rail]);
  React.useEffect(() => {
    document.body.classList.toggle("sidebar-open", mobileOpen);
    return () => { document.body.classList.remove("sidebar-open"); };
  }, [mobileOpen]);

  /* ── Theme ── */
  React.useEffect(() => {
    try { const v = localStorage.getItem("theme"); if (v === "dark" || v === "light") setTheme(v); } catch (_) {}
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (_) {}
  };

  const handleLogout = () => {
    setAvatarOpen(false);
    logoutMutation.mutate(undefined, {
      onSuccess: () => { localStorage.removeItem("satbds_token"); window.location.href = "/login"; },
    });
  };

  const isActive = (href: string) =>
    href === "/portal" ? location === "/portal" : location.startsWith(href);

  const activeLabel =
    title ||
    NAV_GROUPS.flatMap((g) => g.items).find((i) => isActive(i.href))?.label ||
    "Portal";

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?"
    : "?";
  const fullName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "Delegate";

  const onToggle = () => {
    if (window.innerWidth >= 769) setRail((r) => !r);
    else setMobileOpen((o) => !o);
  };

  return (
    <>
      {/* ── Sidebar ── */}
      <aside className={mobileOpen ? "sidebar open" : "sidebar"} aria-label="Delegate Portal navigation">
        <div className="sidebar-brand">
          <div className="brand-icon">S</div>
          <div className="brand-name">Delegate <small>Portal</small></div>
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div className="nav-group" key={group.section}>
              <div className="nav-label">{group.section}</div>
              {group.items.map((item) => {
                const active    = isActive(item.href);
                const hasBadge  = item.key === "notifications" && unreadCount > 0;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={active ? "nav-link active" : "nav-link"}
                    data-label={item.label}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="icon">{item.icon}</span>
                    <span className="nav-text">{item.label}</span>
                    {hasBadge && (
                      <span className="badge badge-teal">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" title={fullName}>
            <div className="avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="name">{fullName}</div>
              <div className="role">Delegate</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="topbar-left">
          <button className="sidebar-toggle" type="button" aria-label="Toggle sidebar" onClick={onToggle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <span>Portal</span>
            <span className="sep" aria-hidden="true">›</span>
            <span className="current">{activeLabel}</span>
          </nav>
        </div>

        <div className="search-box">
          <span className="s-icon">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" />
            </svg>
          </span>
          <input type="text" placeholder="Search…" aria-label="Search" readOnly />
          <kbd>⌘K</kbd>
        </div>

        <div className="topbar-right">
          {/* Theme toggle */}
          <button className="tb-btn theme-toggle" type="button" title="Toggle theme" aria-label="Toggle theme" onClick={toggleTheme}>
            <svg className="theme-icon-dark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <svg className="theme-icon-light" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          </button>

          {/* Notifications */}
          <Link href="/portal/notifications">
            <button className="tb-btn tb-notifications" type="button" title="Notifications" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 3a6 6 0 00-6 6c0 6-3 7-3 7h18s-3-1-3-7a6 6 0 00-6-6z" />
                <path d="M10.5 21a1.5 1.5 0 003 0" />
              </svg>
              {unreadCount > 0 && <span className="dot" />}
            </button>
          </Link>

          {/* Messages */}
          <button className="tb-btn tb-messages" type="button" title="Messages" aria-label="Messages">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </button>

          {/* Avatar + dropdown */}
          <div ref={avatarRef} style={{ position: "relative" }}>
            <button
              className="tb-avatar"
              type="button"
              title={fullName}
              aria-haspopup="true"
              aria-expanded={avatarOpen}
              onClick={() => setAvatarOpen((o) => !o)}
            >
              {initials}
            </button>
            {avatarOpen && (
              <div
                className="menu-popover"
                role="menu"
                style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", left: "auto", minWidth: 180 }}
              >
                <div className="menu-item" style={{ fontWeight: 600, cursor: "default", opacity: 0.9 }}>
                  {fullName}
                </div>
                <div className="menu-separator" />
                <Link href="/portal/profile">
                  <button className="menu-item" role="menuitem" onClick={() => setAvatarOpen(false)}>
                    My Profile
                  </button>
                </Link>
                <Link href="/portal/support">
                  <button className="menu-item" role="menuitem" onClick={() => setAvatarOpen(false)}>
                    Support
                  </button>
                </Link>
                <div className="menu-separator" />
                <button
                  className="menu-item"
                  role="menuitem"
                  style={{ color: "var(--red)" }}
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="main" id="main-content" tabIndex={-1}>
        <div className="page-wrapper">
          <div className="page-header">
            <div className="page-header-row">
              <div>
                <p className="page-pretitle">SATBDS 2027 — Delegate Portal</p>
                <h1 className="page-title">{activeLabel}</h1>
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

        <footer className="gen-footer">
          <span>3rd Southeast Asia Ticks &amp; Tick-borne Diseases Symposium · 22–23 March 2027 · Sunway Putra Hotel, KL</span>
          <span>SATBDS 2027</span>
        </footer>
      </main>
    </>
  );
}

/* ── Icons (function declarations so they hoist above the NAV_GROUPS const) ── */
function IcoDash()      { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="4" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="10" width="7" height="11" rx="1.5"/></svg>; }
function IcoClipboard() { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>; }
function IcoDoc()       { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function IcoReceipt()   { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 21V3h14v18l-3-2-3 2-3-2-3 2-2-2z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>; }
function IcoCal()       { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 4v6M16 4v6"/></svg>; }
function IcoUsers()     { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function IcoProfile()   { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function IcoBell()      { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 3a6 6 0 00-6 6c0 6-3 7-3 7h18s-3-1-3-7a6 6 0 00-6-6z"/><path d="M10.5 21a1.5 1.5 0 003 0"/></svg>; }
function IcoHelp()      { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>; }
