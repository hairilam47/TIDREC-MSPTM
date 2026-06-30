import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Speakers from "@/pages/Speakers";
import CommitteePage from "@/pages/Committee";
import AbstractPage from "@/pages/Abstract";
import ProgrammePage from "@/pages/Programme";
import ContactPage from "@/pages/Contact";
import AboutPage from "@/pages/About";
import RegistrationInfoPage from "@/pages/RegistrationInfo";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminAnalytics from "@/pages/admin/Analytics";
import AdminReports from "@/pages/admin/Reports";
import AdminRegistrations from "@/pages/admin/Registrations";
import AdminRegistrationCategories from "@/pages/admin/RegistrationCategories";
import AdminPayments from "@/pages/admin/Payments";
import AdminInvoices from "@/pages/admin/Invoices";
import AdminAbstracts from "@/pages/admin/Abstracts";
import AdminSpeakers from "@/pages/admin/Speakers";
import AdminCommittee from "@/pages/admin/Committee";
import AdminProgramme from "@/pages/admin/Programme";
import AdminSponsors from "@/pages/admin/Sponsors";
import AdminAnnouncements from "@/pages/admin/Announcements";
import AdminEmails from "@/pages/admin/Emails";
import AdminUsers from "@/pages/admin/Users";
import AdminSettings from "@/pages/admin/Settings";

import PortalDashboard from "@/pages/portal/Dashboard";
import PortalRegistration from "@/pages/portal/Registration";
import PortalAbstracts from "@/pages/portal/Abstracts";
import PortalNewAbstract from "@/pages/portal/NewAbstract";
import PortalAbstractDetails from "@/pages/portal/AbstractDetails";
import PortalInvoices from "@/pages/portal/Invoices";
import PortalProgramme from "@/pages/portal/Programme";
import PortalSpeakers from "@/pages/portal/Speakers";
import PortalProfile from "@/pages/portal/Profile";
import PortalNotifications from "@/pages/portal/Notifications";
import PortalSupport from "@/pages/portal/Support";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Marketing Site */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/registration" component={RegistrationInfoPage} />
      <Route path="/register" component={Register} />
      <Route path="/speakers" component={Speakers} />
      <Route path="/committee" component={CommitteePage} />
      <Route path="/abstract" component={AbstractPage} />
      <Route path="/programme" component={ProgrammePage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/about" component={AboutPage} />

      {/* Admin Portal */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/admin/registrations" component={AdminRegistrations} />
      <Route path="/admin/registration-categories" component={AdminRegistrationCategories} />
      <Route path="/admin/payments" component={AdminPayments} />
      <Route path="/admin/invoices" component={AdminInvoices} />
      <Route path="/admin/abstracts" component={AdminAbstracts} />
      <Route path="/admin/speakers" component={AdminSpeakers} />
      <Route path="/admin/committee" component={AdminCommittee} />
      <Route path="/admin/programme" component={AdminProgramme} />
      <Route path="/admin/sponsors" component={AdminSponsors} />
      <Route path="/admin/announcements" component={AdminAnnouncements} />
      <Route path="/admin/emails" component={AdminEmails} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/settings" component={AdminSettings} />

      {/* Delegate Portal */}
      <Route path="/portal" component={PortalDashboard} />
      <Route path="/portal/registration" component={PortalRegistration} />
      <Route path="/portal/abstracts" component={PortalAbstracts} />
      <Route path="/portal/abstracts/new" component={PortalNewAbstract} />
      <Route path="/portal/abstracts/:id" component={PortalAbstractDetails} />
      <Route path="/portal/invoices" component={PortalInvoices} />
      <Route path="/portal/programme" component={PortalProgramme} />
      <Route path="/portal/speakers" component={PortalSpeakers} />
      <Route path="/portal/profile" component={PortalProfile} />
      <Route path="/portal/notifications" component={PortalNotifications} />
      <Route path="/portal/support" component={PortalSupport} />

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
