import { Route, Router, Switch } from "wouter";
import { ToastProvider } from "./hooks/useToast";
import { useSheetSync } from "./hooks/useSheetSync";
import { IdentityProvider } from "./hooks/useIdentity";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/Dashboard";
import { ShiftsPage } from "./pages/Shifts";
import { PointsPage } from "./pages/Points";

function rawBase(): string {
  const b = import.meta.env.BASE_URL || "/";
  return b.endsWith("/") && b !== "/" ? b.slice(0, -1) : b === "/" ? "" : b;
}

export default function App() {
  const camp = useSheetSync();
  return (
    <ToastProvider>
      <IdentityProvider campers={camp.data.campers}>
        <Router base={rawBase()}>
          <AppShell camp={camp}>
            <Switch>
              <Route path="/" component={() => <DashboardPage camp={camp} />} />
              <Route path="/shifts" component={() => <ShiftsPage camp={camp} />} />
              <Route path="/points" component={() => <PointsPage camp={camp} />} />
              <Route>
                <div className="card text-center text-gray-400">
                  Page not found. Head back to the camp fire.
                </div>
              </Route>
            </Switch>
          </AppShell>
        </Router>
      </IdentityProvider>
    </ToastProvider>
  );
}
