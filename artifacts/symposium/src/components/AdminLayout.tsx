import React from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Mic2,
  Calendar,
  Star,
  Bell,
  BarChart3,
  LogOut,
  Menu,
  ClipboardList,
  CreditCard,
  Receipt,
  Shield,
  TrendingUp,
  Settings,
  Mail,
  ChevronRight,
} from "lucide-react";

export default function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [location, setLocation] = useLocation();
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

  const navSections = [
    {
      label: "OVERVIEW",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
        { href: "/admin/reports", label: "Reports", icon: BarChart3 },
      ],
    },
    {
      label: "MANAGEMENT",
      items: [
        { href: "/admin/registrations", label: "Registrations", icon: ClipboardList },
        { href: "/admin/payments", label: "Payments", icon: CreditCard },
        { href: "/admin/invoices", label: "Invoices", icon: Receipt },
        { href: "/admin/abstracts", label: "Abstracts", icon: FileText },
        { href: "/admin/speakers", label: "Speakers", icon: Mic2 },
        { href: "/admin/programme", label: "Programme", icon: Calendar },
        { href: "/admin/sponsors", label: "Sponsors", icon: Star },
      ],
    },
    {
      label: "ADMINISTRATION",
      items: [
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/emails", label: "Emails", icon: Mail },
        { href: "/admin/settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  };

  const currentTitle =
    title ||
    navSections.flatMap((s) => s.items).find((i) => isActive(i.href))?.label ||
    "Admin";

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "A";

  const SidebarContent = () => (
    <div
      style={{ background: "#0B2744", width: 240, borderRight: "1px solid rgba(200,155,60,0.2)" }}
      className="flex flex-col h-screen overflow-y-auto flex-shrink-0"
    >
      {/* Branding — gold accent bottom border distinguishes admin from portal */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: "3px solid #C89B3C" }}>
        <div className="flex items-center gap-3">
          <div
            style={{ background: "#C89B3C" }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          >
            S
          </div>
          <div>
            <div className="text-white font-serif font-bold text-sm leading-tight">SATBDS 2027</div>
            <div className="text-xs flex items-center gap-1 font-semibold" style={{ color: "#C89B3C" }}>
              <Shield className="w-3 h-3" />
              Admin Portal
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-1">
            <div
              className="text-[11px] font-bold tracking-[0.12em] uppercase px-2.5 pt-3 pb-1.5"
              style={{ color: "rgba(200,155,60,0.5)" }}
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
                  className="group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all mb-0.5 no-underline"
                  style={
                    active
                      ? { color: "#C89B3C", background: "rgba(200,155,60,0.12)", borderLeft: "3px solid #C89B3C" }
                      : { color: "rgba(255,255,255,0.65)", borderLeft: "3px solid transparent" }
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight
                    className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                    style={{ color: active ? "#C89B3C" : "rgba(255,255,255,0.5)" }}
                  />
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div
            style={{ background: "#C89B3C" }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-[13px] font-medium truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-[11px] font-semibold" style={{ color: "#C89B3C" }}>Administrator</div>
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
    <div className="flex min-h-screen" style={{ background: "#EEF1F5" }}>
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
        {/* Header — gold top accent strip distinguishes admin from portal */}
        <header
          className="bg-white sticky top-0 z-40 flex items-center justify-between px-6"
          style={{ height: 58, borderBottom: "1px solid #e9ecef", borderTop: "3px solid #C89B3C" }}
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
            <span
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
              style={{ background: "#C89B3C" }}
            >
              <Shield className="w-3 h-3" />
              Admin
            </span>
            <a href="/portal/">
              <button
                className="hidden sm:block px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors hover:bg-gray-50"
                style={{ borderColor: "#e9ecef", color: "#6c757d" }}
              >
                Delegate View
              </button>
            </a>
            {/* separator */}
            <div className="hidden sm:block w-px h-5 flex-shrink-0" style={{ background: "#e9ecef" }} />
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0 select-none cursor-default"
              style={{ background: "#C89B3C" }}
              title={user ? `${user.firstName} ${user.lastName}` : "Admin"}
            >
              {initials}
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{ color: "#6c757d" }}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
