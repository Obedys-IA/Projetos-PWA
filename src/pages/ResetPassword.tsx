import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsSessionReady(true);
      }
    });

    // Verificação inicial caso o evento já tenha ocorrido
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // A URL de recuperação de senha cria uma sessão temporária
        setIsSessionReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validatePassword = (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regex.test(password)) {
      setPasswordError('A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula e número.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSessionReady) {
      showError('Sessão inválida. Por favor, use o link enviado para o seu email.');
      return;
    }

    if (password !== confirmPassword) {
      showError('As senhas não coincidem.');
      return;
    }

    if (!validatePassword(password)) {
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      showError(`Erro ao redefinir a senha: ${error.message}`);
    } else {
      showSuccess('Senha redefinida com sucesso! Você já pode fazer login.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundImage: 'url("/backgroundlogin.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-orange-800/70 to-green-900/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md mx-4">
        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white drop-shadow-lg">
              Criar Nova Senha
            </CardTitle>
            <CardDescription className="text-white/80">
              Digite sua nova senha abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90 text-sm font-medium">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
                    required
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-full px-3 text-white/50 hover:text-white hover:bg-white/10" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-white/90 text-sm font-medium">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
                    required
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-full px-3 text-white/50 hover:text-white hover:bg-white/10" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordError && (
                  <div className="flex items-center gap-2 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300" 
                disabled={!isSessionReady}
              >
                {isSessionReady ? 'Redefinir Senha' : 'Aguardando sessão...'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;