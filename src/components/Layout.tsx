import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  FileText, 
  ChartBar, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useHistoryLogger } from '@/hooks/useHistorico';
import { useSupabase } from '@/hooks/useSupabase';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { registrarHistorico } = useSupabase();

  // Registrar histórico de acessos
  useHistoryLogger();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['administrador', 'colaborador', 'gerencia'] },
    { path: '/upload', label: 'Upload', icon: Upload, roles: ['administrador', 'colaborador'] },
    { path: '/registros', label: 'Registros', icon: FileText, roles: ['administrador', 'colaborador'] },
    { path: '/relatorios', label: 'Relatórios', icon: ChartBar, roles: ['administrador', 'colaborador', 'fretista', 'gerencia'] },
    { path: '/perfil', label: 'Perfil', icon: User, roles: ['administrador', 'colaborador', 'fretista', 'novo'] },
    { path: '/configuracoes', label: 'Configurações', icon: Settings, roles: ['administrador'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.tipo || 'novo')
  );

  const handleLogout = async () => {
    try {
      // Registrar logout no histórico
      if (user) {
        await registrarHistorico({
          usuario: user.nome,
          tela: 'Logout',
          acao: 'Usuário fez logout'
        });
      }
    } catch (error) {
      console.error('Erro ao registrar logout no histórico:', error);
    }
    
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para mobile */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <img src="/logocanhotos.png" alt="CHECKNF" className="h-8" />
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="p-4">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors",
                    location.pathname === item.path
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:bg-white lg:shadow-lg lg:border-r">
        <div className="flex items-center justify-center p-6 border-b">
          <img src="/logocanhotos.png" alt="CHECKNF" className="h-12" />
        </div>
        <nav className="p-4">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors",
                  location.pathname === item.path
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Bem-vindo, {user?.nome || 'Usuário'}
              </span>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.nome?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;