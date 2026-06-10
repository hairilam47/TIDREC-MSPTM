import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { RequireAuth } from "@/lib/auth";

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

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

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
