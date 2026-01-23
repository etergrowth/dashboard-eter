import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Página de Reset de Password
 * Acedida via link do email de reset
 */
export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Verificar se há token de reset na URL
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Verificar se há hash de reset na URL
        const hash = window.location.hash;
        if (!hash || !hash.includes('access_token')) {
          setError('Link de reset inválido ou expirado. Por favor, solicite um novo reset.');
          setIsValidating(false);
          return;
        }

        // O Supabase processa automaticamente o hash e cria sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setError('Não foi possível validar o link de reset. Por favor, solicite um novo reset.');
          setIsValidating(false);
          return;
        }

        setIsValidating(false);
      } catch (err) {
        console.error('Erro ao validar sessão:', err);
        setError('Erro ao processar link de reset.');
        setIsValidating(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (password.length < 6) {
      setError('A password deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As passwords não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      // Atualizar password usando Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      console.error('Erro ao atualizar password:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao atualizar password. Por favor, tente novamente.'
      );
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Password Atualizada</CardTitle>
            <CardDescription>
              A sua password foi atualizada com sucesso!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Será redirecionado para a página de login em breve...
            </p>
            <Button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          {/* Branding */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Eter Growth</span>
          </div>

          <CardTitle className="text-2xl font-bold">Redefinir Password</CardTitle>
          <CardDescription>
            Introduza a sua nova password abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="password">Nova Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Introduza a nova password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
              <FieldDescription>
                A password deve ter pelo menos 6 caracteres.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">Confirmar Password</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirme a nova password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
              <FieldDescription>
                Introduza novamente a password para confirmação.
              </FieldDescription>
            </Field>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !password || !confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A atualizar...
                </>
              ) : (
                'Atualizar Password'
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-sm"
              >
                Voltar ao Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
