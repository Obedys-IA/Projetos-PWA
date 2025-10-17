import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, AlertCircle, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { showError, showSuccess } from '@/utils/toast';

const Login: React.FC = () => {
  const { user, login, register, resetPassword, isLoading: isAuthLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  useEffect(() => {
    const error = searchParams.get('error_description');
    if (error) {
      showError(decodeURIComponent(error.replace(/\+/g, ' ')));
      // Limpa a URL para não mostrar o erro novamente no refresh
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  if (isAuthLoading && !isSubmitting) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-16 w-16 text-green-500 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/splash" replace />;
  }

  const validatePassword = (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regex.test(password)) {
      setPasswordError('A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula e número.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      showSuccess('Login realizado com sucesso!');
      // A navegação será tratada pelo componente App.tsx ao detectar a mudança no estado `user`
    } catch (error) {
      // O erro já é tratado e exibido pelo `login` function
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(registerPassword)) return;
    
    setIsSubmitting(true);
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
    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await resetPassword(resetEmail);
    if (success) {
      setIsForgotPassword(false);
    }
    setIsSubmitting(false);
  };

  const isLoading = isAuthLoading || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/backgroundlogin.png")' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-orange-800/70 to-green-900/80 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <img src="/logocanhotos.png" alt="CHECKNF - GDM" className="h-20 w-auto mx-auto mb-4 drop-shadow-2xl" />
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">CHECKNF - GDM</h1>
          <p className="text-lg text-white/90 drop-shadow">Sistema de Gestão de Notas Fiscais</p>
        </div>

        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white drop-shadow-lg">
              {isForgotPassword ? 'Recuperar Senha' : 'Acesso ao Sistema'}
            </CardTitle>
            <CardDescription className="text-white/80">
              {isForgotPassword ? 'Digite seu e-mail para receber o link de recuperação.' : 'Faça login ou cadastre-se para continuar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isForgotPassword ? (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm border border-white/20">
                  <TabsTrigger value="login" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Login</TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Cadastro</TabsTrigger>
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
                          disabled={isLoading} 
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
                          disabled={isLoading} 
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
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isLoading ? 'Entrando...' : 'Entrar'}
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-white/90 text-sm font-medium">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input 
                          id="register-password" 
                          type={showRegisterPassword ? 'text' : 'password'} 
                          placeholder="Digite sua senha" 
                          value={registerPassword} 
                          onChange={(e) => { 
                            setRegisterPassword(e.target.value); 
                            if (passwordError) validatePassword(e.target.value); 
                          }} 
                          className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm" 
                          required 
                          disabled={isLoading}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="absolute right-0 top-0 h-full px-3 text-white/50 hover:text-white hover:bg-white/10" 
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        >
                          {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
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
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isLoading ? 'Enviando...' : 'Enviar Link'}
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
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
