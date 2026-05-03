import { Route, Router, Switch } from "wouter";
import { ToastProvider } from "./hooks/useToast";
import { useCampData } from "./hooks/useCampData";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/Dashboard";
import { CampersPage } from "./pages/Campers";
import { ShiftsPage } from "./pages/Shifts";
import { PointsPage } from "./pages/Points";
import { LayoutPage } from "./pages/Layout";
import { KitchenPage } from "./pages/Kitchen";

function rawBase(): string {
  const b = import.meta.env.BASE_URL || "/";
  // wouter expects no trailing slash
  return b.endsWith("/") && b !== "/" ? b.slice(0, -1) : b === "/" ? "" : b;
}

export default function App() {
  const camp = useCampData();
  return (
    <ToastProvider>
      <Router base={rawBase()}>
        <AppShell camp={camp}>
          <Switch>
            <Route path="/" component={() => <DashboardPage camp={camp} />} />
            <Route path="/campers" component={() => <CampersPage camp={camp} />} />
            <Route path="/shifts" component={() => <ShiftsPage camp={camp} />} />
            <Route path="/points" component={() => <PointsPage camp={camp} />} />
            <Route path="/layout" component={() => <LayoutPage camp={camp} />} />
            <Route path="/kitchen" component={() => <KitchenPage camp={camp} />} />
            <Route>
              <div className="card text-center text-zinc-400">
                Page not found. Head back to the camp fire.
              </div>
            </Route>
          </Switch>
        </AppShell>
      </Router>
    </ToastProvider>
  );
}
