import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * Página de Login com Google OAuth e Email/Password
 * Layout de duas colunas no desktop (formulário + imagem)
 * Layout de uma coluna no mobile (apenas formulário)
 */
export const Login = () => {
  const { isAuthenticated, signInWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingEmailPassword, setIsLoadingEmailPassword] = useState(false);

  // Se já está autenticado, redirecionar para dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      await signInWithGoogle();
      // O redirecionamento será feito automaticamente pelo Supabase
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao fazer login. Por favor, tente novamente.'
      );
      setIsSigningIn(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingEmailPassword(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Verificar se email está autorizado
      if (data.user?.email) {
        const allowedEmails = [
          'geral@etergrowth.com',
          'rivdrgc@gmail.com',
          'luisvaldorio@gmail.com',
        ];
        
        if (!allowedEmails.includes(data.user.email.toLowerCase())) {
          await supabase.auth.signOut();
          setError('Email não autorizado. Apenas membros da equipa Eter podem aceder.');
          setIsLoadingEmailPassword(false);
          return;
        }
      }

      // Redirecionar para dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao fazer login. Verifique as suas credenciais.'
      );
      setIsLoadingEmailPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Por favor, introduza o seu email primeiro.');
      return;
    }

    // Verificar se email está autorizado
    const allowedEmails = [
      'geral@etergrowth.com',
      'rivdrgc@gmail.com',
      'luisvaldorio@gmail.com',
    ];
    
    if (!allowedEmails.includes(email.toLowerCase())) {
      setError('Email não autorizado. Apenas membros da equipa Eter podem solicitar reset de password.');
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setError(null);
      alert('Email de recuperação de password enviado! Verifique a sua caixa de entrada.');
    } catch (err) {
      console.error('Erro ao enviar email de recuperação:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao enviar email de recuperação.'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Coluna Esquerda - Formulário */}
      <div className="flex-1 flex flex-col justify-center p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-md mx-auto">
          {/* Branding - Topo */}
          <div className="flex items-center gap-2 mb-8">
            <img 
              src="https://ozjafmkfabewxoyibirq.supabase.co/storage/v1/object/public/etergrowthweb/etergrowth.com.svg" 
              alt="Eter Growth Logo" 
              className="w-10 h-10"
            />
            <span className="text-xl font-bold tracking-tight">Eter Growth</span>
          </div>

          {/* Título e Descrição */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Login to your account</h1>
            <p className="text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleEmailPasswordLogin} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoadingEmailPassword || isSigningIn}
              />
            </div>

            {/* Password Input com "Esqueci-me da password" */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:underline"
                  disabled={isLoadingEmailPassword || isSigningIn}
                >
                  Forgot your password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoadingEmailPassword || isSigningIn}
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoadingEmailPassword || isSigningIn}
            >
              {isLoadingEmailPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A autenticar...
                </>
              ) : (
                'Login'
              )}
            </Button>

            {/* Separator */}
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn || isLoadingEmailPassword}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A autenticar...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Login with Google
                </>
              )}
            </Button>
          </form>

          {/* Mensagem de acesso restrito */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Apenas membros autorizados da equipa Eter podem aceder a este dashboard.
          </p>
        </div>
      </div>

      {/* Coluna Direita - Imagem de fundo (apenas desktop) */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://ozjafmkfabewxoyibirq.supabase.co/storage/v1/object/public/etergrowthweb/imagem%20fundo%20dashboard%20eter.png)'
        }}
      />
    </div>
  );
};
