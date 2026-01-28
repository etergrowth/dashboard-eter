import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * Página exibida quando um utilizador tenta aceder com email não autorizado
 */
export const Unauthorized = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Acesso Negado</CardTitle>
          <CardDescription>
            Este dashboard é exclusivo para a equipa interna da Eter Growth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4 text-sm">
            <p className="mb-2 font-medium">Apenas contas autorizadas podem aceder:</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>Conta corporativa da Eter Growth</li>
              <li>Contas pessoais da equipa interna</li>
            </ul>
          </div>

          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <p>
              O email utilizado não está autorizado a aceder a este sistema.
              Se acredita que deveria ter acesso, contacte a administração.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/login')}
              className="flex-1"
              variant="outline"
            >
              Voltar ao Login
            </Button>
            <Button
              onClick={handleLogout}
              className="flex-1"
              variant="destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Terminar Sessão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
