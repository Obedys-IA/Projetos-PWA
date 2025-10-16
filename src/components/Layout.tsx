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
  X,
  TrendingUp,
  Package,
  Users,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      roles: ['administrador', 'colaborador', 'gerencia'],
      description: 'Visão geral'
    },
    { 
      path: '/upload', 
      label: 'Upload', 
      icon: Upload, 
      roles: ['administrador', 'colaborador'],
      description: 'Importar notas'
    },
    { 
      path: '/registros', 
      label: 'Registros', 
      icon: FileText, 
      roles: ['administrador', 'colaborador'],
      description: 'Gerenciar notas'
    },
    { 
      path: '/relatorios', 
      label: 'Relatórios', 
      icon: ChartBar, 
      roles: ['administrador', 'colaborador', 'fretista', 'gerencia'],
      description: 'Análises'
    },
    { 
      path: '/perfil', 
      label: 'Perfil', 
      icon: User, 
      roles: ['administrador', 'colaborador', 'fretista', 'novo'],
      description: 'Minha conta'
    },
    { 
      path: '/configuracoes', 
      label: 'Configurações', 
      icon: Settings, 
      roles: ['administrador'],
      description: 'Administração'
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.tipo || 'novo')
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserRoleColor = () => {
    switch (user?.tipo) {
      case 'administrador':
        return 'bg-red-500';
      case 'colaborador':
        return 'bg-blue-500';
      case 'fretista':
        return 'bg-green-500';
      case 'gerencia':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUserRoleLabel = () => {
    switch (user?.tipo) {
      case 'administrador':
        return 'Administrador';
      case 'colaborador':
        return 'Colaborador';
      case 'fretista':
        return 'Fretista';
      case 'gerencia':
        return 'Gerência';
      default:
        return 'Novo';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex">
      {/* Sidebar para mobile */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-orange-400 rounded-lg blur opacity-75" />
                <img 
                  src="/logocanhotos.png" 
                  alt="CHECKNF" 
                  className="relative h-8 w-auto"
                  style={{ maxHeight: '32px', width: 'auto' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="font-bold text-lg text-gray-800 dark:text-white">CHECKNF</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gestão de NFs</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-lg transform scale-105"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-1"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isActive 
                      ? "bg-white/20" 
                      : "bg-gray-100 dark:bg-gray-700 group-hover:bg-green-100 dark:group-hover:bg-green-900"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
            
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Sair</div>
                  <div className="text-xs opacity-70">Encerrar sessão</div>
                </div>
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-80 bg-white dark:bg-gray-800 shadow-2xl border-r border-gray-200 dark:border-gray-700">
          {/* Header do sidebar */}
          <div className="flex items-center justify-center p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-orange-400 rounded-2xl blur opacity-75 animate-pulse" />
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-4 border border-white/20 dark:border-gray-700">
                  <img 
                    src="/logocanhotos.png" 
                    alt="CHECKNF" 
                    className="h-16 w-auto"
                    style={{ maxHeight: '64px', width: 'auto' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gradient-green-orange">CHECKNF</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sistema de Gestão</p>
            </div>
          </div>
          
          {/* Navegação */}
          <nav className="flex-1 px-6 py-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
                      isActive
                        ? "bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-lg transform scale-105"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-1"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-white/20 shadow-lg" 
                        : "bg-gray-100 dark:bg-gray-700 group-hover:bg-green-100 dark:group-hover:bg-green-900 group-hover:scale-110"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
          
          {/* User info e logout */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className={`w-12 h-12 ${getUserRoleColor()} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {user?.nome?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 dark:text-white">{user?.nome}</div>
                <Badge variant="secondary" className="text-xs">
                  {getUserRoleLabel()}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
          <div className="flex items-center justify-between px-responsive py-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden hover:bg-green-100 dark:hover:bg-green-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Bem-vindo de volta
                </div>
                <div className="font-semibold text-gray-800 dark:text-white">
                  {user?.nome}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <div className="relative">
                  <div className={`w-10 h-10 ${getUserRoleColor()} rounded-full flex items-center justify-center text-white font-medium shadow-lg`}>
                    {user?.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-responsive overflow-auto">
          <div className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;