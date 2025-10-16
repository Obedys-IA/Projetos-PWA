import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, AlertCircle, CheckCircle, Key } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { showSuccess, showError } from '@/utils/toast';

const Login: React.FC = () => {
  const { user, login, register, resetPassword, verifyAndResetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  useEffect(() => {
    // Verificar se o usuário acabou de confirmar o email
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');
    
    if (error) {
      if (error === 'access_denied') {
        showError('O link de confirmação expirou. Solicite um novo email de confirmação.');
      } else {
        showError(`Erro na confirmação: ${error}`);
      }
    }
    
    if (accessToken && refreshToken) {
      setEmailConfirmed(true);
      showSuccess('Email confirmado com sucesso! Você já pode fazer login.');
      
      // Limpar a URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  if (user) {
    return <Navigate to="/splash" replace />;
  }

  const validatePassword = (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      showError('Preencha todos os campos');
      return;
    }

    const success = await login(loginEmail, loginPassword);
    if (!success) {
      showError('Email ou senha incorretos');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword) {
      showError('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (!validatePassword(registerPassword)) {
      setPasswordError('A senha deve ter no mínimo 8 dígitos, com letra maiúscula, minúscula e número');
      return;
    }
    
    if (!registerEmail.includes('@')) {
      showError('Digite um email válido');
      return;
    }
    
    setPasswordError('');
    
    const success = await register({
      nome: registerName,
      email: registerEmail,
      telefone: registerPhone,
      password: registerPassword,
      tipo: 'novo'
    });
    
    if (success) {
      // Limpar formulário
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterPhone('');
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      showError('Digite um email válido');
      return;
    }

    const success = await resetPassword(resetEmail);
    if (success) {
      setShowResetForm(true);
      showSuccess('Código de recuperação enviado para seu email!');
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword || !confirmPassword) {
      showError('Preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('As senhas não coincidem');
      return;
    }

    if (!validatePassword(newPassword)) {
      setPasswordError('A nova senha deve ter no mínimo 8 dígitos, com letra maiúscula, minúscula e número');
      return;
    }

    // Usar função real de verificação e reset
    const success = await verifyAndResetPassword(resetCode, newPassword);
    if (success) {
      setShowResetForm(false);
      setIsForgotPassword(false);
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo principal */}
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/logocanhotos.png" 
              alt="CHECKNF - GDM" 
              className="h-20 w-auto"
              style={{ maxHeight: '80px', width: 'auto' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Fallback: mostrar texto se a imagem não carregar
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<h1 class="text-3xl font-bold text-gray-800">CHECKNF - GDM</h1>';
                }
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">CHECKNF - GDM</h1>
          <p className="text-gray-600">Sistema de Gestão de Notas Fiscais</p>
        </div>

        {emailConfirmed && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Email Confirmado!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Seu cadastro foi confirmado com sucesso. Faça login para continuar.
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>
              {isForgotPassword ? 'Recuperar Senha' : 'Faça login ou cadastre-se para continuar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isForgotPassword ? (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Cadastro</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Digite sua senha"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Entrar
                    </Button>
                    
                    <div className="text-center">
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => setIsForgotPassword(true)}
                      >
                        Esqueceu sua senha?
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone (opcional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Digite sua senha"
                          value={registerPassword}
                          onChange={(e) => {
                            setRegisterPassword(e.target.value);
                            if (passwordError) setPasswordError('');
                          }}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {passwordError && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>{passwordError}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Mínimo 8 caracteres: 1 maiúscula, 1 minúscula, 1 número
                      </p>
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Cadastrar
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4">
                {!showResetForm ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button onClick={handleForgotPassword} className="w-full">
                      Enviar Código de Recuperação
                    </Button>
                    
                    <div className="text-center">
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => setIsForgotPassword(false)}
                      >
                        Voltar para o login
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-code">Código de Recuperação</Label>
                      <Input
                        id="reset-code"
                        type="text"
                        placeholder="Digite o código recebido"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Digite a nova senha"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirme a nova senha"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    {passwordError && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{passwordError}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button onClick={handleResetPassword} className="flex-1">
                        Redefinir Senha
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowResetForm(false);
                          setResetCode('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;