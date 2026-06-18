import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RequireAdmin } from "./lib/auth";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminAnalytics from "@/pages/admin/Analytics";
import AdminRegistrations from "@/pages/admin/Registrations";
import AdminPayments from "@/pages/admin/Payments";
import AdminInvoices from "@/pages/admin/Invoices";
import AdminAbstracts from "@/pages/admin/Abstracts";
import AdminSpeakers from "@/pages/admin/Speakers";
import AdminProgramme from "@/pages/admin/Programme";
import AdminSponsors from "@/pages/admin/Sponsors";
import AdminUsers from "@/pages/admin/Users";
import AdminAnnouncements from "@/pages/admin/Announcements";
import AdminEmails from "@/pages/admin/Emails";
import AdminReports from "@/pages/admin/Reports";
import AdminSettings from "@/pages/admin/Settings";
import AdminRegistrationCategories from "@/pages/admin/RegistrationCategories";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/admin">
        <RequireAdmin><AdminDashboard /></RequireAdmin>
      </Route>
      <Route path="/admin/analytics">
        <RequireAdmin><AdminAnalytics /></RequireAdmin>
      </Route>
      <Route path="/admin/registrations">
        <RequireAdmin><AdminRegistrations /></RequireAdmin>
      </Route>
      <Route path="/admin/payments">
        <RequireAdmin><AdminPayments /></RequireAdmin>
      </Route>
      <Route path="/admin/invoices">
        <RequireAdmin><AdminInvoices /></RequireAdmin>
      </Route>
      <Route path="/admin/abstracts">
        <RequireAdmin><AdminAbstracts /></RequireAdmin>
      </Route>
      <Route path="/admin/speakers">
        <RequireAdmin><AdminSpeakers /></RequireAdmin>
      </Route>
      <Route path="/admin/programme">
        <RequireAdmin><AdminProgramme /></RequireAdmin>
      </Route>
      <Route path="/admin/sponsors">
        <RequireAdmin><AdminSponsors /></RequireAdmin>
      </Route>
      <Route path="/admin/users">
        <RequireAdmin><AdminUsers /></RequireAdmin>
      </Route>
      <Route path="/admin/announcements">
        <RequireAdmin><AdminAnnouncements /></RequireAdmin>
      </Route>
      <Route path="/admin/emails">
        <RequireAdmin><AdminEmails /></RequireAdmin>
      </Route>
      <Route path="/admin/reports">
        <RequireAdmin><AdminReports /></RequireAdmin>
      </Route>
      <Route path="/admin/settings">
        <RequireAdmin><AdminSettings /></RequireAdmin>
      </Route>
      <Route path="/admin/registration-categories">
        <RequireAdmin><AdminRegistrationCategories /></RequireAdmin>
      </Route>
      {/* Fallback: unauthenticated → login */}
      <Route>
        {() => { window.location.href = "/login"; return null; }}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* base="" so all existing /admin/... hrefs in page components resolve correctly */}
        <WouterRouter base="">
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
