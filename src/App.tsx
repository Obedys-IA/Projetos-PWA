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

// Componente para redirecionar usuários autenticados
const AuthenticatedRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (user) {
    return <Navigate to="/splash" replace />;
  }

  return <>{children}</>;
};

// Componente para proteger rotas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

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
              {/* Rotas Públicas */}
              <Route path="/login" element={
                <AuthenticatedRedirect>
                  <Login />
                </AuthenticatedRedirect>
              } />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Rota de Splash/Redirecionamento */}
              <Route path="/splash" element={<Splash />} />
              
              {/* Rota Padrão */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Rotas Protegidas */}
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
              
              {/* Rota 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;