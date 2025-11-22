import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import OrderBook from "./pages/OrderBook";
import Borrow from "./pages/Borrow";
import Lend from "./pages/Lend";
import Dashboard from "./pages/Dashboard";

function Router() {
  return (
     <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/order-book"} component={OrderBook} />
      <Route path={"/404"} component={NotFound} />
      <Route path={"/lend"} component={Lend} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
