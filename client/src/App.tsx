import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { QuizProvider } from "./contexts/quiz-context";
import { AuthProvider } from "./contexts/auth-context";
import NotFound from "./pages/not-found";
import Home from "./pages/home";
import Register from "./pages/register";
import Login from "./pages/login";
import Quiz from "./pages/quiz";
import Results from "./pages/results";
import Header from "./components/layout/header";
import Dashboard from "./components/dashboard/dashboard";
import AdminPage from "./pages/admin";
import RankingPage from "./pages/ranking";
import SimpleRankingPage from "./pages/simple-ranking";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/results/:sessionToken" component={Results} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/ranking" component={RankingPage} />
      <Route path="/simple-ranking" component={SimpleRankingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <QuizProvider>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <Toaster />
              <Router />
            </div>
          </QuizProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;