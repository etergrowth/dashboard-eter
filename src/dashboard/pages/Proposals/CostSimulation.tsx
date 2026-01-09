import * as React from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Calculator } from 'lucide-react';
import { useAllServices } from '../../hooks/useServices';
import type { Service } from '../../../types';

interface CostItem {
  id: string;
  serviceId: string;
  serviceName: string;
  hours: number;
  softwareCosts: number;
  hourlyRate: number;
  baseCost: number;
  lineTotal: number;
  lineMargin: number;
}

export function CostSimulation() {
  const { data: services, isLoading: servicesLoading } = useAllServices();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [items, setItems] = React.useState<CostItem[]>([]);
  const [desiredMargin, setDesiredMargin] = React.useState(40); // Margem desejada em percentagem
  const [finalSellingPrice, setFinalSellingPrice] = React.useState(0);

  // Calcular totais
  const totals = React.useMemo(() => {
    const totalCost = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalMargin = items.reduce((sum, item) => sum + item.lineMargin, 0);
    const totalBaseCost = items.reduce((sum, item) => sum + (item.baseCost * item.hours), 0);
    const totalSoftwareCosts = items.reduce((sum, item) => sum + item.softwareCosts, 0);
    
    // Calcular preço de venda com margem desejada
    const costWithMargin = totalBaseCost * (1 + desiredMargin / 100);
    const sellingPrice = costWithMargin + totalSoftwareCosts;
    
    return {
      totalCost,
      totalMargin,
      totalBaseCost,
      totalSoftwareCosts,
      sellingPrice,
      marginPercentage: totalBaseCost > 0 ? ((sellingPrice - totalBaseCost - totalSoftwareCosts) / totalBaseCost) * 100 : 0,
    };
  }, [items, desiredMargin]);

  // Atualizar preço de venda quando os totais mudarem
  React.useEffect(() => {
    setFinalSellingPrice(totals.sellingPrice);
  }, [totals.sellingPrice]);

  const handleAddItem = () => {
    if (!services || services.length === 0) {
      alert('Não há serviços disponíveis. Por favor, adicione serviços primeiro.');
      return;
    }

    const firstService = services[0];
    const newItem: CostItem = {
      id: `temp-${Date.now()}`,
      serviceId: firstService.id,
      serviceName: firstService.name,
      hours: 0,
      softwareCosts: 0,
      hourlyRate: Number(firstService.final_hourly_rate) || 0,
      baseCost: Number(firstService.base_cost_per_hour) || 0,
      lineTotal: 0,
      lineMargin: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleServiceChange = (itemId: string, serviceId: string) => {
    const service = services?.find(s => s.id === serviceId);
    if (!service) return;

    setItems(items.map(item => {
      if (item.id === itemId) {
        const hours = item.hours || 0;
        const softwareCosts = item.softwareCosts || 0;
        const hourlyRate = Number(service.final_hourly_rate) || 0;
        const baseCost = Number(service.base_cost_per_hour) || 0;
        const lineTotal = (hours * hourlyRate) + softwareCosts;
        const lineMargin = (hourlyRate - baseCost) * hours;

        return {
          ...item,
          serviceId: service.id,
          serviceName: service.name,
          hourlyRate,
          baseCost,
          lineTotal,
          lineMargin,
        };
      }
      return item;
    }));
  };

  const handleHoursChange = (itemId: string, hours: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const h = Math.max(0, hours);
        const softwareCosts = item.softwareCosts || 0;
        const lineTotal = (h * item.hourlyRate) + softwareCosts;
        const lineMargin = (item.hourlyRate - item.baseCost) * h;

        return {
          ...item,
          hours: h,
          lineTotal,
          lineMargin,
        };
      }
      return item;
    }));
  };

  const handleSoftwareCostsChange = (itemId: string, softwareCosts: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const sc = Math.max(0, softwareCosts);
        const lineTotal = (item.hours * item.hourlyRate) + sc;

        return {
          ...item,
          softwareCosts: sc,
          lineTotal,
        };
      }
      return item;
    }));
  };

  const handleHourlyRateChange = (itemId: string, hourlyRate: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const hr = Math.max(0, hourlyRate);
        const lineTotal = (item.hours * hr) + item.softwareCosts;
        const lineMargin = (hr - item.baseCost) * item.hours;

        return {
          ...item,
          hourlyRate: hr,
          lineTotal,
          lineMargin,
        };
      }
      return item;
    }));
  };

  if (servicesLoading) {
    return (
      <div className="glass-panel p-6 rounded-xl">
        <p className="text-center text-muted-foreground">A carregar serviços...</p>
      </div>
    );
  }

  return (
    <div className={`glass-panel rounded-xl transition-all duration-300 ${
      isExpanded ? 'p-6' : 'p-4'
    }`}>
      <div className={`flex items-center justify-between ${isExpanded ? 'mb-6' : 'mb-0'}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-semibold text-card-foreground hover:text-primary transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
          <Calculator className="w-5 h-5" />
          <span>Simulação de Custos</span>
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Itens de custo */}
        <div className="space-y-4 mb-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="border border-border rounded-lg p-4 bg-muted/5"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-card-foreground">
                  Item {index + 1}
                </h4>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition text-destructive"
                  title="Remover item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Seleção de Serviço */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Serviço
                  </label>
                  <select
                    value={item.serviceId}
                    onChange={(e) => handleServiceChange(item.id, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    {services?.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} ({Math.round(Number(service.final_hourly_rate))}€/h)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Horas */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Horas
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={item.hours || ''}
                    onChange={(e) => handleHoursChange(item.id, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                {/* Custos de Software */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Custos Software (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.softwareCosts || ''}
                    onChange={(e) => handleSoftwareCostsChange(item.id, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* Preço/Hora (editável) */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Preço/Hora (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.hourlyRate || ''}
                    onChange={(e) => handleHourlyRateChange(item.id, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Base: {Math.round(item.baseCost)}€/h
                  </p>
                </div>
              </div>

              {/* Resumo do item */}
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Linha</p>
                  <p className="text-sm font-semibold text-card-foreground">
                    {item.lineTotal.toFixed(2)}€
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Margem Linha</p>
                  <p className="text-sm font-semibold text-chart-2">
                    {item.lineMargin.toFixed(2)}€
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Custo Base</p>
                  <p className="text-sm text-muted-foreground">
                    {(item.baseCost * item.hours).toFixed(2)}€
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">% Margem</p>
                  <p className="text-sm text-muted-foreground">
                    {item.baseCost > 0 
                      ? (((item.hourlyRate - item.baseCost) / item.baseCost) * 100).toFixed(1)
                      : '0.0'
                    }%
                  </p>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum item adicionado ainda.</p>
              <p className="text-sm mt-2">Clique em "Adicionar Item" para começar.</p>
            </div>
          )}
        </div>

        {/* Botão para adicionar item */}
        <div className="mb-6">
          <button
            onClick={handleAddItem}
            className="glass-button px-4 py-2 rounded-lg text-secondary-foreground flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar Item
          </button>
        </div>

        {/* Resumo e configuração de margem */}
        {items.length > 0 && (
          <div className="border-t border-border pt-6 space-y-4">
            {/* Configuração de margem desejada */}
            <div className="bg-muted/10 rounded-lg p-4">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Margem Desejada (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1000"
                value={desiredMargin}
                onChange={(e) => setDesiredMargin(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Esta margem será aplicada sobre o custo base total para calcular o preço de venda sugerido.
              </p>
            </div>

            {/* Totais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-muted/10 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Custo Base Total</p>
                <p className="text-lg font-semibold text-card-foreground">
                  {totals.totalBaseCost.toFixed(2)}€
                </p>
              </div>
              <div className="bg-muted/10 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Custos Software</p>
                <p className="text-lg font-semibold text-card-foreground">
                  {totals.totalSoftwareCosts.toFixed(2)}€
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Preço de Venda Sugerido</p>
                <p className="text-lg font-semibold text-primary">
                  {totals.sellingPrice.toFixed(2)}€
                </p>
              </div>
              <div className="bg-chart-2/10 rounded-lg p-4 border border-chart-2/20">
                <p className="text-xs text-muted-foreground mb-1">Margem Total</p>
                <p className="text-lg font-semibold text-chart-2">
                  {(totals.sellingPrice - totals.totalBaseCost - totals.totalSoftwareCosts).toFixed(2)}€
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ({totals.marginPercentage.toFixed(1)}%)
                </p>
              </div>
            </div>

            {/* Preço de venda final (editável) */}
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Preço de Venda Final (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={finalSellingPrice.toFixed(2)}
                onChange={(e) => setFinalSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-background border border-primary/30 rounded-lg text-card-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Margem final: {totals.totalBaseCost > 0 
                    ? (((finalSellingPrice - totals.totalBaseCost - totals.totalSoftwareCosts) / totals.totalBaseCost) * 100).toFixed(1)
                    : '0.0'
                  }%
                </span>
                <span className="text-chart-2 font-medium">
                  Lucro: {(finalSellingPrice - totals.totalBaseCost - totals.totalSoftwareCosts).toFixed(2)}€
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
