import React from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useGetMe, useLogout } from "@workspace/api-client-react";

/* ── Nav structure — includes group: true collapsibles ── */
type NavChild = { key: string; href: string; label: string };
type NavFlat  = { key: string; href: string; label: string; icon: React.ReactNode; badge?: React.ReactNode };
type NavGroup = { group: true; label: string; icon: React.ReactNode; children: NavChild[]; badge?: React.ReactNode };
type NavItem  = NavFlat | NavGroup;

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Overview",
    items: [
      { key: "dashboard",  href: "/admin",           label: "Dashboard",  icon: <IcoDash /> },
      {
        group: true,
        label: "Analytics & Reports",
        icon: <IcoAnalytics />,
        children: [
          { key: "analytics", href: "/admin/analytics", label: "Analytics" },
          { key: "reports",   href: "/admin/reports",   label: "Reports" },
        ],
      },
    ],
  },
  {
    section: "Management",
    items: [
      {
        group: true,
        label: "Registrations",
        icon: <IcoUsers />,
        children: [
          { key: "registrations",  href: "/admin/registrations",           label: "All Registrations" },
          { key: "reg-categories", href: "/admin/registration-categories", label: "Categories & Pricing" },
          { key: "payments",       href: "/admin/payments",                label: "Payments" },
          { key: "invoices",       href: "/admin/invoices",                label: "Invoices" },
        ],
      },
      { key: "abstracts", href: "/admin/abstracts", label: "Abstracts", icon: <IcoDoc /> },
      { key: "speakers",  href: "/admin/speakers",  label: "Speakers",  icon: <IcoMic /> },
      { key: "programme", href: "/admin/programme", label: "Programme", icon: <IcoCal /> },
      { key: "sponsors",  href: "/admin/sponsors",  label: "Sponsors",  icon: <IcoStar /> },
    ],
  },
  {
    section: "Administration",
    items: [
      { key: "users",         href: "/admin/users",         label: "Users",         icon: <IcoTeam /> },
      { key: "announcements", href: "/admin/announcements", label: "Announcements", icon: <IcoBell /> },
      { key: "emails",        href: "/admin/emails",        label: "Emails",        icon: <IcoMail /> },
      { key: "settings",      href: "/admin/settings",      label: "Settings",      icon: <IcoSettings /> },
    ],
  },
];

export default function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [location] = useLocation();
  const [rail, setRail]           = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [theme, setTheme]         = React.useState<"light" | "dark">("light");
  const [avatarOpen, setAvatarOpen] = React.useState(false);
  const avatarRef = React.useRef<HTMLDivElement>(null);

  const { data: user } = useGetMe();
  const logoutMutation = useLogout();

  /* ── Click-outside for avatar dropdown ── */
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    if (avatarOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [avatarOpen]);

  /* ── body.data-shell + rail/open body classes ── */
  React.useEffect(() => {
    document.body.dataset.shell = "admin";
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
    href === "/admin" ? location === "/admin" : location.startsWith(href);

  const activeLabel =
    title ||
    NAV.flatMap((s) =>
      s.items.flatMap((i) =>
        "group" in i ? i.children.map((c) => ({ label: c.label, href: c.href })) : [{ label: i.label, href: i.href }]
      )
    ).find((i) => isActive(i.href))?.label ||
    "Admin";

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "A"
    : "A";
  const fullName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "Administrator";

  const onToggle = () => {
    if (window.innerWidth >= 769) setRail((r) => !r);
    else setMobileOpen((o) => !o);
  };

  return (
    <>
      {/* ── Sidebar ── */}
      <aside className={mobileOpen ? "sidebar open" : "sidebar"} aria-label="Admin navigation">
        <div className="sidebar-brand">
          <div className="brand-icon">S</div>
          <div className="brand-name">SEAT-MSPTM <small>2027</small></div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((section) => (
            <div className="nav-group" key={section.section}>
              <div className="nav-label">{section.section}</div>
              {section.items.map((item) =>
                "group" in item ? (
                  <NavTreeItem key={item.label} item={item} isActive={isActive} onClose={() => setMobileOpen(false)} />
                ) : (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={isActive(item.href) ? "nav-link active" : "nav-link"}
                    data-label={item.label}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="icon">{item.icon}</span>
                    <span className="nav-text">{item.label}</span>
                    {item.badge}
                  </Link>
                )
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" title={fullName}>
            <div className="avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="name">{fullName}</div>
              <div className="role">Administrator</div>
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
            <span>Admin</span>
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
          <input type="text" placeholder="Search pages or run a command…" aria-label="Search" readOnly />
          <kbd>⌘K</kbd>
        </div>

        <div className="topbar-right">
          {/* Link to Delegate Portal */}
          <a href="/portal/" className="tb-btn tb-docs" title="Delegate Portal" style={{ textDecoration: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span>Delegate Portal</span>
          </a>

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
          <button className="tb-btn tb-notifications" type="button" title="Notifications" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 3a6 6 0 00-6 6c0 6-3 7-3 7h18s-3-1-3-7a6 6 0 00-6-6z" />
              <path d="M10.5 21a1.5 1.5 0 003 0" />
            </svg>
          </button>

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
                <div
                  className="menu-item"
                  style={{ fontWeight: 600, cursor: "default", opacity: 0.9 }}
                >
                  {fullName}
                </div>
                <div className="menu-separator" />
                <Link href="/admin/settings">
                  <button className="menu-item" role="menuitem" onClick={() => setAvatarOpen(false)}>
                    Settings
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
                <p className="page-pretitle">SEAT-MSPTM 2027 — Admin Portal</p>
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
          <span>SEAT-MSPTM 2027</span>
        </footer>
      </main>
    </>
  );
}

/* ── Collapsible nav-tree ── */
function NavTreeItem({
  item, isActive, onClose,
}: {
  item: NavGroup;
  isActive: (href: string) => boolean;
  onClose: () => void;
}) {
  const childActive = item.children.some((c) => isActive(c.href));
  const [open, setOpen] = React.useState(childActive);

  return (
    <div className={["nav-tree", open ? "open" : "", childActive ? "has-active" : ""].filter(Boolean).join(" ")}>
      <button
        type="button"
        className="nav-link nav-toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="icon">{item.icon}</span>
        <span className="nav-text">{item.label}</span>
        {item.badge}
        <svg className="nav-chev" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M6 4l4 4-4 4" />
        </svg>
      </button>
      <div className="nav-sub">
        <div className="nav-sub-inner">
          {item.children.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={isActive(c.href) ? "nav-sublink active" : "nav-sublink"}
              aria-current={isActive(c.href) ? "page" : undefined}
              onClick={onClose}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Icons (function declarations so they hoist above the NAV const) ── */
function IcoDash()     { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="4" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="10" width="7" height="11" rx="1.5"/></svg>; }
function IcoAnalytics(){ return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 19V5M8 19v-8M12 19V9M16 19v-5M20 19v-9"/></svg>; }
function IcoUsers()    { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function IcoDoc()      { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function IcoMic()      { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>; }
function IcoCal()      { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 4v6M16 4v6"/></svg>; }
function IcoStar()     { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function IcoTeam()     { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>; }
function IcoBell()     { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 3a6 6 0 00-6 6c0 6-3 7-3 7h18s-3-1-3-7a6 6 0 00-6-6z"/><path d="M10.5 21a1.5 1.5 0 003 0"/></svg>; }
function IcoMail()     { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 6 10-6"/></svg>; }
function IcoSettings() { return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>; }
