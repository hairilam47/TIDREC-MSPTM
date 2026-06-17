import React from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useGetMe, useGetAnnouncements, useLogout } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Calendar,
  Users,
  UserCircle,
  Receipt,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  ChevronLeft,
  Search,
} from "lucide-react";

export default function PortalLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
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

  const navSections = [
    {
      label: "MAIN",
      items: [
        { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
        { href: "/portal/registration", label: "My Registration", icon: ClipboardList },
        { href: "/portal/abstracts", label: "My Abstracts", icon: FileText },
        { href: "/portal/invoices", label: "Invoices", icon: Receipt },
      ],
    },
    {
      label: "CONFERENCE",
      items: [
        { href: "/portal/programme", label: "Programme", icon: Calendar },
        { href: "/portal/speakers", label: "Speakers", icon: Users },
      ],
    },
    {
      label: "ACCOUNT",
      items: [
        { href: "/portal/profile", label: "Profile", icon: UserCircle },
        {
          href: "/portal/notifications",
          label: "Notifications",
          icon: Bell,
          badge: importantCount > 0 ? importantCount : undefined,
        },
        { href: "/portal/support", label: "Support", icon: HelpCircle },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/portal") return location === "/portal";
    return location.startsWith(href);
  };

  const currentTitle =
    title ||
    navSections.flatMap((s) => s.items).find((i) => isActive(i.href))?.label ||
    "Portal";

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  const SIDEBAR_FULL = 240;
  const SIDEBAR_MINI = 64;
  const sidebarW = collapsed ? SIDEBAR_MINI : SIDEBAR_FULL;

  const SidebarInner = ({ mini = false }: { mini?: boolean }) => (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "#0B2744", width: mini ? SIDEBAR_MINI : SIDEBAR_FULL, transition: "width 0.22s ease" }}
    >
      {/* Profile card at top — Gentelella convention */}
      <div
        className="flex items-center gap-3 flex-shrink-0"
        style={{
          padding: mini ? "14px 12px" : "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          minHeight: 68,
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: "#0E6E74" }}
        >
          {initials}
        </div>
        {!mini && (
          <div className="min-w-0 flex-1">
            <div className="text-white text-[13px] font-semibold truncate leading-snug">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-[11px] font-semibold mt-0.5" style={{ color: "#4DC8CE" }}>
              Delegate
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navSections.map((section) => (
          <div key={section.label} className="mb-1">
            {!mini && (
              <div
                className="text-[9px] font-bold tracking-widest uppercase px-4 pt-3 pb-1"
                style={{ color: "rgba(77,200,206,0.45)" }}
              >
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center transition-all mb-0.5 no-underline relative"
                  style={{
                    gap: mini ? 0 : 10,
                    height: 40,
                    paddingLeft: mini ? 20 : 16,
                    paddingRight: mini ? 20 : 16,
                    justifyContent: mini ? "center" : "flex-start",
                    background: active ? "rgba(14,110,116,0.15)" : "transparent",
                    borderLeft: `3px solid ${active ? "#0E6E74" : "transparent"}`,
                  }}
                  title={mini ? item.label : undefined}
                >
                  <Icon
                    className="w-[17px] h-[17px] flex-shrink-0"
                    style={{ color: active ? "#4DC8CE" : "rgba(255,255,255,0.55)" }}
                  />
                  {!mini && (
                    <>
                      <span
                        className="text-[13px] font-medium truncate flex-1"
                        style={{ color: active ? "#4DC8CE" : "rgba(255,255,255,0.72)" }}
                      >
                        {item.label}
                      </span>
                      {(item as { badge?: number }).badge ? (
                        <span
                          className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none flex-shrink-0"
                          style={{ background: "#0E6E74" }}
                        >
                          {(item as { badge?: number }).badge}
                        </span>
                      ) : null}
                    </>
                  )}
                  {mini && (item as { badge?: number }).badge ? (
                    <span
                      className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full text-white text-[8px] font-bold flex items-center justify-center"
                      style={{ background: "#0E6E74" }}
                    >
                      {(item as { badge?: number }).badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      {!mini && (
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex items-center justify-center gap-2 w-full py-3 text-[12px] transition-all flex-shrink-0"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.35)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Collapse</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f7f7" }}>
      {/* Desktop sidebar */}
      <div
        className="hidden lg:block flex-shrink-0 relative"
        style={{ width: sidebarW, transition: "width 0.22s ease" }}
      >
        <div className="fixed top-0 left-0 h-screen z-40" style={{ width: sidebarW, transition: "width 0.22s ease" }}>
          <SidebarInner mini={collapsed} />
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <SidebarInner mini={false} />
          <div
            className="flex-1"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Top navbar ── */}
        <header
          className="bg-white sticky top-0 z-40 flex items-center gap-3"
          style={{
            height: 60,
            borderBottom: "1px solid #e9ecef",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            padding: "0 16px",
          }}
        >
          {/* Hamburger */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 flex-shrink-0"
            style={{ color: "#6c757d" }}
            onClick={() => {
              if (window.innerWidth >= 1024) setCollapsed((c) => !c);
              else setMobileOpen(true);
            }}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2 mr-3 flex-shrink-0">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "#0E6E74" }}
            >
              S
            </div>
            <span className="font-serif font-bold text-[15px] hidden sm:block" style={{ color: "#0B2744" }}>
              SATBDS 2027
            </span>
          </div>

          {/* Search */}
          <div className="relative hidden md:block" style={{ maxWidth: 280, flex: "1 1 auto" }}>
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#adb5bd" }} />
            <input
              type="text"
              placeholder="Search…"
              className="w-full pl-9 pr-3 py-1.5 text-[13px] rounded-lg outline-none transition-all"
              style={{ border: "1px solid #e9ecef", background: "#f8f9fa", color: "#495057" }}
              onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#0E6E74"; }}
              onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e9ecef"; }}
            />
          </div>

          <div className="flex-1" />

          {/* Delegate badge */}
          <div
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0"
            style={{ background: "#e6f4f5", color: "#0E6E74", border: "1px solid rgba(14,110,116,0.35)" }}
          >
            Delegate
          </div>

          {/* Notifications bell */}
          <Link href="/portal/notifications">
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center relative transition-colors hover:bg-gray-50 flex-shrink-0"
              style={{ border: "1px solid #e9ecef", color: "#6c757d", background: "none" }}
            >
              <Bell className="w-4 h-4" />
              {importantCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                  style={{ background: "#C89B3C" }}
                >
                  {importantCount}
                </span>
              )}
            </button>
          </Link>

          {/* Separator */}
          <div className="hidden sm:block w-px h-6 flex-shrink-0" style={{ background: "#e9ecef" }} />

          {/* User + logout */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
              style={{ background: "#0E6E74" }}
              title={user ? `${user.firstName} ${user.lastName}` : "Delegate"}
            >
              {initials}
            </div>
            <span className="text-[13px] font-medium hidden md:block" style={{ color: "#495057" }}>
              {user?.firstName}
            </span>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
              style={{ color: "#adb5bd" }}
              title="Sign out"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#842029"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#adb5bd"; }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ── Page title / breadcrumb strip ── */}
        <div
          className="bg-white flex items-center justify-between px-6 py-2.5"
          style={{ borderBottom: "1px solid #e9ecef" }}
        >
          <h1 className="text-[15px] font-semibold" style={{ color: "#212529" }}>{currentTitle}</h1>
          <nav className="flex items-center gap-1.5 text-[12px]" style={{ color: "#adb5bd" }}>
            <span>Home</span>
            <span>/</span>
            <span style={{ color: "#0E6E74" }}>{currentTitle}</span>
          </nav>
        </div>

        {/* ── Content ── */}
        <main className="flex-1 p-5 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
