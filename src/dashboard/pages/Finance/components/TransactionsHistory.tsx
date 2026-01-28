import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/dashboard/hooks/useTransactions';
import { TEXTS_PT } from '../i18n';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { FileText, CheckCircle2, Clock } from 'lucide-react';
import type { TransacaoFinanceira } from '@/types/finance';
import { ResponsiveTable } from '@/dashboard/components/ResponsiveTable';
import { MobileCard, MobileCardAction } from '@/dashboard/components/MobileCard';

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

  const columns = [
    {
      key: 'data',
      label: TEXTS_PT.tableHeaderDate,
      render: (transaction: TransacaoFinanceira) => formatDate(transaction.data_transacao),
    },
    {
      key: 'descricao',
      label: TEXTS_PT.tableHeaderDescription,
      render: (transaction: TransacaoFinanceira) => (
        <div>
          <div className="font-medium">{transaction.comerciante || transaction.descricao}</div>
          {transaction.comerciante && (
            <div className="text-xs text-muted-foreground">{transaction.descricao}</div>
          )}
        </div>
      ),
    },
    {
      key: 'categoria',
      label: TEXTS_PT.tableHeaderCategory,
      render: (transaction: TransacaoFinanceira) => getCategoryBadge(transaction.categoria),
    },
    {
      key: 'valor',
      label: TEXTS_PT.tableHeaderAmount,
      align: 'right' as const,
      render: (transaction: TransacaoFinanceira) => formatCurrency(transaction.valor, transaction.tipo),
    },
    {
      key: 'recibo',
      label: TEXTS_PT.tableHeaderReceipt,
      align: 'center' as const,
      hideOnMobile: true,
      render: (transaction: TransacaoFinanceira) =>
        (transaction.recibo_url || transaction.id) ? (
          <button
            onClick={() => onReceiptClick?.(transaction.id)}
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Ver recibo"
          >
            <FileText className="w-4 h-4" />
          </button>
        ) : null,
    },
    {
      key: 'status',
      label: TEXTS_PT.tableHeaderStatus,
      align: 'center' as const,
      render: (transaction: TransacaoFinanceira) => getStatusBadge(transaction.estado || 'pendente'),
    },
  ];

  const mobileCardRender = (transaction: TransacaoFinanceira) => {
    const statusColors: Record<string, string> = {
      verificado: 'bg-green-500/10 text-green-600',
      pendente: 'bg-yellow-500/10 text-yellow-600',
    };

    return (
      <MobileCard
        title={transaction.comerciante || transaction.descricao}
        subtitle={transaction.comerciante ? transaction.descricao : undefined}
        status={{
          label: transaction.estado === 'verificado' ? TEXTS_PT.tableStatusVerified : TEXTS_PT.tableStatusPending,
          color: statusColors[transaction.estado || 'pendente'] || statusColors.pendente,
        }}
        fields={[
          {
            label: 'Data',
            value: formatDate(transaction.data_transacao),
          },
          {
            label: 'Categoria',
            value: getCategoryBadge(transaction.categoria),
          },
          {
            label: 'Valor',
            value: formatCurrency(transaction.valor, transaction.tipo),
            highlight: true,
          },
        ]}
        actions={
          (transaction.recibo_url || transaction.id) && onReceiptClick ? (
            <MobileCardAction
              icon={FileText}
              label="Ver Recibo"
              onClick={() => onReceiptClick(transaction.id)}
              variant="primary"
            />
          ) : undefined
        }
      />
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">{TEXTS_PT.tableTitle}</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs">
            {TEXTS_PT.tableViewAll}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        <ResponsiveTable
          columns={columns}
          data={transactions}
          keyExtractor={(transaction) => transaction.id}
          mobileCardRender={mobileCardRender}
          emptyState={
            <p className="text-sm text-muted-foreground text-center py-8">
              Ainda não há transações registadas.
            </p>
          }
        />
      </CardContent>
    </Card>
  );
}
