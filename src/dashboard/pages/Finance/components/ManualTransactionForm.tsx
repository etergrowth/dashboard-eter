import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCategorias } from '@/dashboard/hooks/useCategorias';
import { TEXTS_PT } from '../i18n';
import type { TransactionDraft } from '@/types/finance';
import { Loader2 } from 'lucide-react';

interface ManualTransactionFormProps {
  onTransactionCreated: (draft: TransactionDraft) => void;
  isSubmitting?: boolean;
}

export function ManualTransactionForm({ onTransactionCreated, isSubmitting = false }: ManualTransactionFormProps) {
  const { data: categorias, isLoading: categoriasLoading } = useCategorias();
  
  // Estado inicial do formulário
  const [formData, setFormData] = useState<Partial<TransactionDraft>>({
    tipo: 'despesa',
    valor: 0,
    moeda: 'EUR',
    data_transacao: new Date().toISOString().split('T')[0], // Data de hoje
    comerciante: '',
    descricao: '',
    categoria: '',
    extraido_via: 'manual',
  });

  const handleChange = (field: keyof TransactionDraft, value: any) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };
      
      // Se o tipo mudou, resetar categoria se não for compatível
      if (field === 'tipo' && prev.categoria && categorias) {
        const categoriaAtual = categorias.find((c) => c.nome === prev.categoria);
        if (categoriaAtual && categoriaAtual.tipo !== value && categoriaAtual.tipo !== 'ambos') {
          newData.categoria = '';
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.tipo || !formData.valor || formData.valor <= 0 || !formData.data_transacao || !formData.descricao || !formData.categoria) {
      return;
    }

    const draft: TransactionDraft = {
      tipo: formData.tipo as 'receita' | 'despesa',
      valor: formData.valor!,
      moeda: formData.moeda || 'EUR',
      data_transacao: formData.data_transacao!,
      comerciante: formData.comerciante || '',
      descricao: formData.descricao!,
      categoria: formData.categoria!,
      extraido_via: 'manual',
    };

    onTransactionCreated(draft);
    
    // Reset do formulário após submissão
    setFormData({
      tipo: 'despesa',
      valor: 0,
      moeda: 'EUR',
      data_transacao: new Date().toISOString().split('T')[0],
      comerciante: '',
      descricao: '',
      categoria: '',
      extraido_via: 'manual',
    });
  };

  // Filtrar categorias baseado no tipo de transação
  const categoriasFiltradas = categorias?.filter(
    (c) => c.tipo === formData.tipo || c.tipo === 'ambos'
  ) || [];
  
  // Encontrar categoria atual
  const categoriaAtual = categorias?.find((c) => c.nome === formData.categoria);

  return (
    <Card className="w-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">📝 Entrada Manual</CardTitle>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            Manual
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col">
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
          {/* Tipo de Transação */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Transação</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.tipo === 'despesa' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handleChange('tipo', 'despesa')}
                disabled={isSubmitting}
              >
                Despesa
              </Button>
              <Button
                type="button"
                variant={formData.tipo === 'receita' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handleChange('tipo', 'receita')}
                disabled={isSubmitting}
              >
                Receita
              </Button>
            </div>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="data">Data da Transação *</Label>
            <Input
              id="data"
              type="date"
              value={formData.data_transacao}
              onChange={(e) => handleChange('data_transacao', e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor *</Label>
            <div className="relative">
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.valor || ''}
                onChange={(e) => handleChange('valor', parseFloat(e.target.value) || 0)}
                required
                disabled={isSubmitting}
                className="text-lg font-semibold pr-12"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                €
              </span>
            </div>
          </div>

          {/* Comerciante */}
          <div className="space-y-2">
            <Label htmlFor="comerciante">Comerciante</Label>
            <Input
              id="comerciante"
              value={formData.comerciante || ''}
              onChange={(e) => handleChange('comerciante', e.target.value)}
              placeholder="Nome do comerciante (opcional)"
              disabled={isSubmitting}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <textarea
              id="descricao"
              value={formData.descricao || ''}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descrição detalhada da transação"
              required
              disabled={isSubmitting}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            {categoriasLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria || ''}
                  onChange={(e) => handleChange('categoria', e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-[length:12px_8px] bg-[right_12px_center] bg-no-repeat pr-10"
                >
                  <option value="" disabled hidden>
                    Selecione uma categoria...
                  </option>
                  {categoriasFiltradas && categoriasFiltradas.length > 0 ? (
                    categoriasFiltradas.map((cat) => (
                      <option key={cat.id} value={cat.nome}>
                        {cat.icone || ''} {cat.nome_display}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Nenhuma categoria disponível
                    </option>
                  )}
                </select>
                {categoriaAtual && (
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoriaAtual.cor || '#6B7280' }}
                    />
                    <span className="text-muted-foreground">{categoriaAtual.nome_display}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Botão de Submissão */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={
                isSubmitting || 
                !formData.tipo || 
                !formData.valor || 
                formData.valor <= 0 || 
                !formData.data_transacao || 
                !formData.descricao || 
                !formData.categoria
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A guardar...
                </>
              ) : (
                'Criar Transação'
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              * Campos obrigatórios
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
