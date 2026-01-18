import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Trainers from "./pages/Trainers";
import Courses from "./pages/Courses";
import Enrollments from "./pages/Enrollments";
import Grades from "./pages/Grades";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import Specialties from "./pages/Specialties";
import Sessions from "./pages/Sessions";
import Groups from "./pages/Groups";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes - Dashboard accessible to all authenticated users */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Admin-only routes */}
            <Route path="/students" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Students />
              </ProtectedRoute>
            } />
            <Route path="/trainers" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Trainers />
              </ProtectedRoute>
            } />
            <Route path="/specialties" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Specialties />
              </ProtectedRoute>
            } />
            <Route path="/sessions" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Sessions />
              </ProtectedRoute>
            } />
            <Route path="/groups" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Groups />
              </ProtectedRoute>
            } />

            {/* Admin, Formateur and Student routes */}
            <Route path="/courses" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'FORMATEUR', 'ETUDIANT']}>
                <Courses />
              </ProtectedRoute>
            } />
            <Route path="/grades" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'FORMATEUR', 'ETUDIANT']}>
                <Grades />
              </ProtectedRoute>
            } />

            {/* All authenticated users */}
            <Route path="/enrollments" element={
              <ProtectedRoute>
                <Enrollments />
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
