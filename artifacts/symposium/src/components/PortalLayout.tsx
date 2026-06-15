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
} from "lucide-react";

export default function PortalLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [location] = useLocation();
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

  const SidebarContent = () => (
    <div
      style={{ background: "#0B2744", width: 240, borderRight: "1px solid rgba(14,110,116,0.3)" }}
      className="flex flex-col h-screen overflow-y-auto flex-shrink-0"
    >
      {/* Branding — teal accent bottom border distinguishes portal from admin */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: "3px solid #0E6E74" }}>
        <div className="flex items-center gap-3">
          <div
            style={{ background: "#0E6E74" }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          >
            S
          </div>
          <div>
            <div className="text-white font-serif font-bold text-sm leading-tight">SATBDS 2027</div>
            <div className="text-xs font-semibold" style={{ color: "#4DC8CE" }}>
              Participant Portal
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-1">
            <div
              className="text-[10px] font-bold tracking-widest uppercase px-2.5 pt-3 pb-1.5"
              style={{ color: "rgba(77,200,206,0.5)" }}
            >
              {section.label}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all mb-0.5 no-underline"
                  style={
                    active
                      ? { color: "#4DC8CE", background: "rgba(14,110,116,0.15)", borderLeft: "2px solid #0E6E74" }
                      : { color: "rgba(255,255,255,0.65)", borderLeft: "2px solid transparent" }
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span
                      className="text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-full leading-none"
                      style={{ background: "#0E6E74" }}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div
            style={{ background: "#0E6E74" }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-[13px] font-medium truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-[11px] truncate" style={{ color: "#4DC8CE" }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] border transition-all"
          style={{ color: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.15)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "#F5F7FA" }}>
      <div className="hidden lg:flex">
        <SidebarContent />
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <SidebarContent />
          <div
            className="flex-1"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header — teal top accent strip distinguishes portal from admin */}
        <header
          className="bg-white sticky top-0 z-40 flex items-center justify-between px-6"
          style={{ height: 58, borderBottom: "1px solid #e9ecef", borderTop: "3px solid #0E6E74" }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1 rounded"
              style={{ color: "#6c757d" }}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-[16px] font-semibold" style={{ color: "#212529" }}>
              {currentTitle}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/portal/notifications">
              <button
                className="w-9 h-9 rounded-lg flex items-center justify-center relative transition-colors hover:bg-gray-50"
                style={{ border: "1px solid #e9ecef", color: "#6c757d", background: "none" }}
              >
                <Bell className="w-4 h-4" />
                {importantCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                    style={{ background: "#C89B3C" }}
                  >
                    {importantCount}
                  </span>
                )}
              </button>
            </Link>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "#0E6E74" }}
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
