import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useSupabase } from './useSupabase';

export const useHistoryLogger = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { registrarHistorico } = useSupabase();

  useEffect(() => {
    if (user) {
      // Função para registrar acesso
      const registrarAcesso = async () => {
        try {
          await registrarHistorico({
            usuario: user.nome,
            tela: getPageName(location.pathname),
            acao: 'Acessou a tela'
          });
        } catch (error) {
          console.error('Erro ao registrar histórico:', error);
        }
      };

      // Registrar acesso com um pequeno delay para evitar múltiplos registros
      const timeoutId = setTimeout(registrarAcesso, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname, user, registrarHistorico]);
};

// Função para obter nome amigável da página
const getPageName = (pathname: string): string => {
  const pageNames: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/upload': 'Upload de Notas Fiscais',
    '/registros': 'Registros de Notas Fiscais',
    '/relatorios': 'Relatórios',
    '/perfil': 'Perfil',
    '/configuracoes': 'Configurações',
    '/login': 'Login'
  };

  return pageNames[pathname] || pathname;
};