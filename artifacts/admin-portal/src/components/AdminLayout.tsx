import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  CreditCard,
  FileText,
  Mic2,
  CalendarDays,
  Star,
  Megaphone,
  Mail,
  ClipboardList,
  Settings,
  UserCog,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/registrations", label: "Registrations", icon: Users },
  { href: "/admin/registration-categories", label: "Categories", icon: ClipboardList },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/abstracts", label: "Abstracts", icon: FileText },
  { href: "/admin/speakers", label: "Speakers", icon: Mic2 },
  { href: "/admin/programme", label: "Programme", icon: CalendarDays },
  { href: "/admin/sponsors", label: "Sponsors", icon: Star },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/emails", label: "Emails", icon: Mail },
  { href: "/admin/users", label: "Users", icon: UserCog },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-[#0B2744] text-white flex flex-col flex-shrink-0 min-h-screen">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-bold text-sm tracking-wide text-white">SEAT-MSPTM 2027</p>
          <p className="text-xs text-white/50 mt-0.5">Admin Portal</p>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}>
                <a
                  className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                    active
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </a>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <a
            href="/api/auth/logout"
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </a>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
