import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Splash from "@/pages/Splash";
import Dashboard from "@/pages/Dashboard";
import Upload from "@/pages/Upload";
import Registros from "@/pages/Registros";
import Relatorios from "@/pages/Relatorios";
import Perfil from "@/pages/Perfil";
import Configuracoes from "@/pages/Configuracoes";
import NotFound from "@/pages/NotFound";
import ResetPassword from "@/pages/ResetPassword";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/splash" element={<Splash />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/upload" element={
                <ProtectedRoute>
                  <Layout>
                    <Upload />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/registros" element={
                <ProtectedRoute>
                  <Layout>
                    <Registros />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/relatorios" element={
                <ProtectedRoute>
                  <Layout>
                    <Relatorios />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <Layout>
                    <Perfil />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/configuracoes" element={
                <ProtectedRoute>
                  <Layout>
                    <Configuracoes />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;