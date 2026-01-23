import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/dashboard/hooks/useTransactions';
import { TEXTS_PT } from '../i18n';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { FileText, CheckCircle2, Clock } from 'lucide-react';
import type { TransacaoFinanceira } from '@/types/finance';

interface TransactionsHistoryProps {
  onReceiptClick?: (transactionId: string) => void;
}

export function TransactionsHistory({ onReceiptClick }: TransactionsHistoryProps) {
  const { data: transactions, isLoading } = useTransactions(10);

  const formatCurrency = (value: number, tipo: string) => {
    const formatted = new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);

    return (
      <span className={tipo === 'receita' ? 'text-green-600 font-semibold' : 'text-gray-900 font-semibold'}>
        {formatted}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: pt });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (estado: string) => {
    if (estado === 'verificado') {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {TEXTS_PT.tableStatusVerified}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
        <Clock className="w-3 h-3 mr-1" />
        {TEXTS_PT.tableStatusPending}
      </Badge>
    );
  };

  const getCategoryBadge = (categoria: string) => {
    // Cores padrão por categoria
    const categoryColors: Record<string, string> = {
      software_saas: 'bg-blue-500/10 text-blue-600',
      viagens: 'bg-purple-500/10 text-purple-600',
      refeicoes: 'bg-red-500/10 text-red-600',
      material_escritorio: 'bg-green-500/10 text-green-600',
      receitas: 'bg-green-500/10 text-green-600',
      subscricoes: 'bg-yellow-500/10 text-yellow-600',
      servicos_publicos: 'bg-indigo-500/10 text-indigo-600',
      marketing: 'bg-pink-500/10 text-pink-600',
      servicos_profissionais: 'bg-teal-500/10 text-teal-600',
      outro: 'bg-gray-500/10 text-gray-600',
    };

    const categoryNames: Record<string, string> = {
      software_saas: TEXTS_PT.categorySoftwareSaaS,
      viagens: TEXTS_PT.categoryTravel,
      refeicoes: TEXTS_PT.categoryMeals,
      material_escritorio: TEXTS_PT.categoryOfficeSupplies,
      receitas: TEXTS_PT.categoryIncome,
      subscricoes: TEXTS_PT.categorySubscriptions,
      servicos_publicos: TEXTS_PT.categoryUtilities,
      marketing: TEXTS_PT.categoryMarketing,
      servicos_profissionais: TEXTS_PT.categoryProfessionalServices,
      outro: TEXTS_PT.categoryOther,
    };

    return (
      <Badge variant="outline" className={categoryColors[categoria] || categoryColors.outro}>
        {categoryNames[categoria] || categoria}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{TEXTS_PT.tableTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">A carregar...</p>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{TEXTS_PT.tableTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Ainda não há transações registadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{TEXTS_PT.tableTitle}</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs">
            {TEXTS_PT.tableViewAll}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">
                  {TEXTS_PT.tableHeaderDate}
                </th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">
                  {TEXTS_PT.tableHeaderDescription}
                </th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">
                  {TEXTS_PT.tableHeaderCategory}
                </th>
                <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">
                  {TEXTS_PT.tableHeaderAmount}
                </th>
                <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground">
                  {TEXTS_PT.tableHeaderReceipt}
                </th>
                <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground">
                  {TEXTS_PT.tableHeaderStatus}
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-2 text-sm">{formatDate(transaction.data_transacao)}</td>
                  <td className="py-3 px-2 text-sm">
                    <div>
                      <div className="font-medium">{transaction.comerciante || transaction.descricao}</div>
                      {transaction.comerciante && (
                        <div className="text-xs text-muted-foreground">{transaction.descricao}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2">{getCategoryBadge(transaction.categoria)}</td>
                  <td className="py-3 px-2 text-right">
                    {formatCurrency(transaction.valor, transaction.tipo)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {transaction.recibo_url && (
                      <button
                        onClick={() => onReceiptClick?.(transaction.id)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Ver recibo"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {getStatusBadge(transaction.estado || 'pendente')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
