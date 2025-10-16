import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, AlertCircle, CheckCircle, Key, Mail, Lock, User, Phone } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/backgroundlogin.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Overlay para melhorar legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-orange-800/70 to-green-900/80 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-lg rounded-2xl transform rotate-6" />
              <img 
                src="/logocanhotos.png" 
                alt="CHECKNF - GDM" 
                className="relative h-20 w-auto drop-shadow-2xl"
                style={{ maxHeight: '80px', width: 'auto' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="text-4xl font-bold text-white mb-2">CHECKNF - GDM</div>';
                  }
                }}
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">CHECKNF - GDM</h1>
          <p className="text-lg text-white/90 drop-shadow">Sistema de Gestão de Notas Fiscais</p>
        </div>

        {emailConfirmed && (
          <div className="mb-6 p-4 bg-green-500/20 backdrop-blur-md border border-green-400/30 rounded-xl">
            <div className="flex items-center gap-2 text-green-100">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Email Confirmado!</span>
            </div>
            <p className="text-sm text-green-200 mt-1">
              Seu cadastro foi confirmado com sucesso. Faça login para continuar.
            </p>
          </div>
        )}

        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white drop-shadow-lg">
              {isForgotPassword ? 'Recuperar Senha' : 'Acesso ao Sistema'}
            </CardTitle>
            <CardDescription className="text-white/80">
              {isForgotPassword ? 'Recupere sua senha de forma segura' : 'Faça login ou cadastre-se para continuar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isForgotPassword ? (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm border border-white/20">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                  >
                    Cadastro
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/90 text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white/90 text-sm font-medium">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Digite sua senha"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
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
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Entrar
                    </Button>
                    
                    <div className="text-center">
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-sm text-white/80 hover:text-white hover:underline"
                        onClick={() => setIsForgotPassword(true)}
                      >
                        Esqueceu sua senha?
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="mt-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white/90 text-sm font-medium">Nome</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Seu nome completo"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-white/90 text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white/90 text-sm font-medium">Telefone (opcional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(00) 00000-0000"
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-white/90 text-sm font-medium">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Digite sua senha"
                          value={registerPassword}
                          onChange={(e) => {
                            setRegisterPassword(e.target.value);
                            if (passwordError) setPasswordError('');
                          }}
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
                      {passwordError && (
                        <div className="flex items-center gap-2 text-sm text-red-300">
                          <AlertCircle className="h-4 w-4" />
                          <span>{passwordError}</span>
                        </div>
                      )}
                      <p className="text-xs text-white/60">
                        Mínimo 8 caracteres: 1 maiúscula, 1 minúscula, 1 número
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
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
                      <Label htmlFor="reset-email" className="text-white/90 text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleForgotPassword} 
                      className="w-full bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Enviar Código de Recuperação
                    </Button>
                    
                    <div className="text-center">
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-sm text-white/80 hover:text-white hover:underline"
                        onClick={() => setIsForgotPassword(false)}
                      >
                        Voltar para o login
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-code" className="text-white/90 text-sm font-medium">Código de Recuperação</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="reset-code"
                          type="text"
                          placeholder="Digite o código recebido"
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-white/90 text-sm font-medium">Nova Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Digite a nova senha"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
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
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirme a nova senha"
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
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    {passwordError && (
                      <div className="flex items-center gap-2 text-sm text-red-300">
                        <AlertCircle className="h-4 w-4" />
                        <span>{passwordError}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleResetPassword} 
                        className="flex-1 bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
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
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
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