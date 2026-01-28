import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCategorias } from '@/dashboard/hooks/useCategorias';
import { TEXTS_PT } from '../i18n';
import type { TransactionDraft, DadosExtraidosAI } from '@/types/finance';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface TransactionPreviewProps {
  draft: TransactionDraft | null;
  onConfirm: (draft: TransactionDraft) => void;
  onDiscard: () => void;
}

export function TransactionPreview({ draft, onConfirm, onDiscard }: TransactionPreviewProps) {
  const { data: categorias } = useCategorias();
  const [localDraft, setLocalDraft] = useState<TransactionDraft | null>(draft);
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    if (draft) {
      setLocalDraft(draft);
      setIsEdited(false);
    }
  }, [draft]);

  if (!localDraft) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{TEXTS_PT.previewTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Aguarde o processamento de uma transação...
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleChange = (field: keyof TransactionDraft, value: any) => {
    setLocalDraft((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
    setIsEdited(true);
  };

  const handleConfirm = () => {
    if (localDraft) {
      onConfirm(localDraft);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: pt });
    } catch {
      return dateString;
    }
  };

  const categoriaAtual = categorias?.find((c) => c.nome === localDraft.categoria);

  return (
    <Card>
      <CardHeader className="relative p-4 md:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">{TEXTS_PT.previewTitle}</CardTitle>
          <Badge variant="outline" className={`text-xs ${isEdited ? 'bg-yellow-500/10 text-yellow-600' : 'bg-primary/10 text-primary'}`}>
            {isEdited ? TEXTS_PT.previewBadgeEdited : TEXTS_PT.previewBadgeAI}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
        {/* Data */}
        <div className="space-y-2">
          <Label htmlFor="data">{TEXTS_PT.previewDateLabel}</Label>
          <Input
            id="data"
            type="date"
            value={localDraft.data_transacao}
            onChange={(e) => handleChange('data_transacao', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{formatDate(localDraft.data_transacao)}</p>
        </div>

        {/* Valor */}
        <div className="space-y-2">
          <Label htmlFor="valor">{TEXTS_PT.previewAmountLabel}</Label>
          <div className="relative">
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={localDraft.valor}
              onChange={(e) => handleChange('valor', parseFloat(e.target.value) || 0)}
              className="text-lg font-bold text-primary pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              €
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{formatCurrency(localDraft.valor)}</p>
        </div>

        {/* Comerciante / Descrição */}
        <div className="space-y-2">
          <Label htmlFor="comerciante">{TEXTS_PT.previewMerchantLabel}</Label>
          <Input
            id="comerciante"
            value={localDraft.comerciante}
            onChange={(e) => handleChange('comerciante', e.target.value)}
            placeholder="Nome do comerciante"
            className="mb-2"
          />
          <textarea
            value={localDraft.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
            placeholder="Descrição da transação"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label htmlFor="categoria">{TEXTS_PT.previewCategoryLabel}</Label>
          <select
            id="categoria"
            value={localDraft.categoria}
            onChange={(e) => handleChange('categoria', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">{TEXTS_PT.previewCategoryPlaceholder}</option>
            {categorias
              ?.filter((c) => c.tipo === localDraft.tipo || c.tipo === 'ambos')
              .map((cat) => (
                <option key={cat.id} value={cat.nome}>
                  {cat.icone} {cat.nome_display}
                </option>
              ))}
          </select>
          {categoriaAtual && (
            <div className="flex items-center gap-2 text-xs">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: categoriaAtual.cor || '#6B7280' }}
              />
              <span className="text-muted-foreground">{categoriaAtual.nome_display}</span>
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 md:pt-4">
          <Button onClick={handleConfirm} className="flex-1 text-sm" size="sm">
            {TEXTS_PT.confirmButton}
          </Button>
          <Button variant="ghost" onClick={onDiscard} className="text-sm" size="sm">
            {TEXTS_PT.discardButton}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
