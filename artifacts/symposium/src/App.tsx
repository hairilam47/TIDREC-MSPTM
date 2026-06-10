import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { RequireAuth, RequireAdmin } from "@/lib/auth";

import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

import Dashboard from "@/pages/portal/Dashboard";
import Registration from "@/pages/portal/Registration";
import Abstracts from "@/pages/portal/Abstracts";
import NewAbstract from "@/pages/portal/NewAbstract";
import AbstractDetails from "@/pages/portal/AbstractDetails";
import Programme from "@/pages/portal/Programme";
import Speakers from "@/pages/portal/Speakers";
import Invoices from "@/pages/portal/Invoices";
import Profile from "@/pages/portal/Profile";
import Notifications from "@/pages/portal/Notifications";
import Support from "@/pages/portal/Support";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminRegistrations from "@/pages/admin/Registrations";
import AdminAbstracts from "@/pages/admin/Abstracts";
import AdminSpeakers from "@/pages/admin/Speakers";
import AdminProgramme from "@/pages/admin/Programme";
import AdminSponsors from "@/pages/admin/Sponsors";
import AdminUsers from "@/pages/admin/Users";
import AdminAnnouncements from "@/pages/admin/Announcements";
import AdminReports from "@/pages/admin/Reports";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Delegate Portal */}
      <Route path="/portal">
        <RequireAuth><Dashboard /></RequireAuth>
      </Route>
      <Route path="/portal/registration">
        <RequireAuth><Registration /></RequireAuth>
      </Route>
      <Route path="/portal/abstracts/new">
        <RequireAuth><NewAbstract /></RequireAuth>
      </Route>
      <Route path="/portal/abstracts/:id">
        <RequireAuth><AbstractDetails /></RequireAuth>
      </Route>
      <Route path="/portal/abstracts">
        <RequireAuth><Abstracts /></RequireAuth>
      </Route>
      <Route path="/portal/programme">
        <RequireAuth><Programme /></RequireAuth>
      </Route>
      <Route path="/portal/speakers">
        <RequireAuth><Speakers /></RequireAuth>
      </Route>
      <Route path="/portal/invoices">
        <RequireAuth><Invoices /></RequireAuth>
      </Route>
      <Route path="/portal/profile">
        <RequireAuth><Profile /></RequireAuth>
      </Route>
      <Route path="/portal/notifications">
        <RequireAuth><Notifications /></RequireAuth>
      </Route>
      <Route path="/portal/support">
        <RequireAuth><Support /></RequireAuth>
      </Route>

      {/* Admin Portal */}
      <Route path="/admin">
        <RequireAdmin><AdminDashboard /></RequireAdmin>
      </Route>
      <Route path="/admin/registrations">
        <RequireAdmin><AdminRegistrations /></RequireAdmin>
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
      <Route path="/admin/reports">
        <RequireAdmin><AdminReports /></RequireAdmin>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
