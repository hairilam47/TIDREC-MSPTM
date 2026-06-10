import React from "react";
import { Link, useLocation } from "wouter";
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
  Shield,
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
        setLocation("/login");
      },
    });
  };

  const navSections = [
    {
      label: "OVERVIEW",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/reports", label: "Reports", icon: BarChart3 },
      ],
    },
    {
      label: "MANAGEMENT",
      items: [
        { href: "/admin/registrations", label: "Registrations", icon: ClipboardList },
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
        { href: "/admin/announcements", label: "Announcements", icon: Bell },
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
      style={{ background: "#0B2744", width: 240 }}
      className="flex flex-col h-screen overflow-y-auto flex-shrink-0"
    >
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <div
            style={{ background: "#C89B3C" }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          >
            S
          </div>
          <div>
            <div className="text-white font-serif font-bold text-sm leading-tight">SATBDS 2027</div>
            <div className="text-xs flex items-center gap-1" style={{ color: "#C89B3C" }}>
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
              className="text-[10px] font-bold tracking-widest uppercase px-2.5 pt-3 pb-1.5"
              style={{ color: "rgba(255,255,255,0.3)" }}
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
                      ? { color: "#C89B3C", background: "rgba(200,155,60,0.12)" }
                      : { color: "rgba(255,255,255,0.65)" }
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
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
            <div className="text-[11px]" style={{ color: "#C89B3C" }}>Administrator</div>
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
    <div className="flex min-h-screen" style={{ background: "#F8F9FA" }}>
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
        <header
          className="bg-white sticky top-0 z-40 flex items-center justify-between px-6"
          style={{ height: 58, borderBottom: "1px solid #e9ecef" }}
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
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(200,155,60,0.12)", color: "#C89B3C" }}>
              <Shield className="w-3 h-3" />
              Admin
            </span>
            <Link href="/portal">
              <button
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium border"
                style={{ borderColor: "#e9ecef", color: "#6c757d" }}
              >
                Delegate View
              </button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
