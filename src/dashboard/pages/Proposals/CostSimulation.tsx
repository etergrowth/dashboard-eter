import * as React from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Calculator, Save, X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useAllServices } from '../../hooks/useServices';
import { useCreateProposal, useCreateProposalItem } from '../../hooks/useProposals';
import { useClients } from '../../hooks/useClients';
import type { ProposalInsert } from '../../../types';

interface CostSimulationModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}


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
  desiredMargin: number; // Margem desejada individual para este item
  isExpanded?: boolean;
}

export function CostSimulationModal({ onClose, onSuccess }: CostSimulationModalProps) {
  const { data: services, isLoading: servicesLoading } = useAllServices();
  const { data: clients } = useClients();
  const createProposal = useCreateProposal();
  const createProposalItem = useCreateProposalItem();
  const [currentStep, setCurrentStep] = React.useState(1); // 1: Serviços, 2: Revisão, 3: Dados
  const [items, setItems] = React.useState<CostItem[]>([]);
  const [finalSellingPrice, setFinalSellingPrice] = React.useState(0);
  const [proposalFormData, setProposalFormData] = React.useState({
    title: '',
    client_id: '',
    description: '',
    status: 'draft' as 'draft' | 'sent' | 'negotiating' | 'accepted' | 'rejected',
    valid_until: '',
    notes: '',
  });

  // Calcular totais
  const totals = React.useMemo(() => {
    const totalCost = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalMargin = items.reduce((sum, item) => sum + item.lineMargin, 0);
    const totalBaseCost = items.reduce((sum, item) => sum + (item.baseCost * item.hours), 0);
    const totalSoftwareCosts = items.reduce((sum, item) => sum + item.softwareCosts, 0);

    // Calcular preço de venda com margem desejada individual por item
    const sellingPrice = items.reduce((sum, item) => {
      const baseCostForItem = item.baseCost * item.hours;
      const costWithMargin = baseCostForItem * (1 + (item.desiredMargin || 0) / 100);
      return sum + costWithMargin + item.softwareCosts;
    }, 0);

    // Calcular margem final baseada nas margens individuais de cada item
    // A margem final é calculada como a média ponderada das margens individuais
    // ponderada pelo custo base de cada item
    let weightedMarginSum = 0;
    items.forEach(item => {
      const itemBaseCost = item.baseCost * item.hours;
      if (itemBaseCost > 0) {
        weightedMarginSum += (item.desiredMargin || 0) * itemBaseCost;
      }
    });
    const finalMarginPercentage = totalBaseCost > 0 ? weightedMarginSum / totalBaseCost : 0;

    return {
      totalCost,
      totalMargin,
      totalBaseCost,
      totalSoftwareCosts,
      sellingPrice,
      marginPercentage: finalMarginPercentage, // Margem final baseada nas margens individuais
    };
  }, [items]);

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
      desiredMargin: 40, // Margem padrão de 40%
      isExpanded: true,
    };
    setItems([...items, newItem]);
  };

  const toggleItemExpanded = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
    ));
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
          desiredMargin: item.desiredMargin || 40, // Preservar margem desejada ou usar padrão
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

  const handleDesiredMarginChange = (itemId: string, margin: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          desiredMargin: Math.max(0, Math.min(1000, margin)),
        };
      }
      return item;
    }));
  };

  const handleSaveAsProposal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Adicione pelo menos um item à simulação antes de guardar como proposta.');
      return;
    }

    if (!proposalFormData.title.trim()) {
      alert('Por favor, preencha o título da proposta.');
      return;
    }

    try {
      // Criar a proposta
      // Garantir que client_id seja null se for string vazia
      const clientId = proposalFormData.client_id && proposalFormData.client_id.trim() !== '' 
        ? proposalFormData.client_id 
        : null;
      
      // Garantir que valid_until seja null se for string vazia
      const validUntil = proposalFormData.valid_until && proposalFormData.valid_until.trim() !== '' 
        ? proposalFormData.valid_until 
        : null;
      
      // Garantir que os valores numéricos sejam válidos
      const totalAmount = Number(finalSellingPrice) || 0;
      const totalMargin = Number(totals.totalMargin) || 0;
      
      const proposalData: ProposalInsert = {
        title: proposalFormData.title.trim(),
        description: proposalFormData.description?.trim() || null,
        client_id: clientId,
        status: proposalFormData.status,
        valid_until: validUntil,
        notes: proposalFormData.notes?.trim() || null,
        total_amount: totalAmount,
        total_margin: totalMargin,
      };

      const newProposal = await createProposal.mutateAsync(proposalData);
      
      // Criar os items da proposta a partir da simulação
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Garantir que todos os valores numéricos sejam válidos
        const estimatedHours = Number(item.hours) || 0;
        const softwareCosts = Number(item.softwareCosts) || 0;
        const appliedHourlyRate = Number(item.hourlyRate) || 0;
        
        // Validar que os campos obrigatórios não sejam zero/inválidos
        if (!item.serviceId) {
          throw new Error(`Item ${i + 1}: ID do serviço é obrigatório.`);
        }
        if (appliedHourlyRate <= 0) {
          throw new Error(`Item ${i + 1}: Taxa horária deve ser maior que zero.`);
        }
        
        await createProposalItem.mutateAsync({
          proposal_id: newProposal.id,
          service_id: item.serviceId,
          estimated_hours: estimatedHours,
          software_costs: softwareCosts,
          applied_hourly_rate: appliedHourlyRate,
          notes: item.desiredMargin ? `Margem desejada: ${item.desiredMargin}%` : null,
          position: i,
        });
      }

      // Limpar simulação e fechar modal
      setItems([]);
      setFinalSellingPrice(0);
      setCurrentStep(1);
      setProposalFormData({
        title: '',
        client_id: '',
        description: '',
        status: 'draft',
        valid_until: '',
        notes: '',
      });

      alert('Proposta criada com sucesso!');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar proposta:', error);
      
      // Mostrar mensagem de erro mais específica
      const errorMessage = error?.message || error?.error?.message || 'Erro desconhecido ao criar proposta.';
      alert(`Erro ao criar proposta: ${errorMessage}\n\nPor favor, verifique os dados e tente novamente.`);
    }
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

  const canGoToNextStep = () => {
    if (currentStep === 1) {
      return items.length > 0 && items.every(item => item.hours > 0);
    }
    if (currentStep === 2) {
      return true; // Sempre pode avançar da revisão
    }
    return false;
  };

  const handleNextStep = () => {
    if (currentStep < 3 && canGoToNextStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (servicesLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
          <div className="p-6">
            <p className="text-center text-muted-foreground">A carregar serviços...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col my-8">
        {/* Header do Modal */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Calculator className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Assistente de Planeamento de Proposta
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Passo {currentStep} de 3: {currentStep === 1 ? 'Definir Serviços' : currentStep === 2 ? 'Revisar Custos' : 'Dados da Proposta'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicador de Progresso */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                      currentStep >= step
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {currentStep > step ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      currentStep >= step
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step === 1 ? 'Serviços' : step === 2 ? 'Revisão' : 'Dados'}
                  </span>
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded ${
                      currentStep > step
                        ? 'bg-orange-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Conteúdo do Modal */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Passo 1: Definir Serviços e Horas */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Adicione os serviços e horas estimadas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure os serviços que serão incluídos na proposta e as horas estimadas para cada um.
                </p>
              </div>
              {/* Itens de custo */}
              <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => toggleItemExpanded(item.id)}
                  className="flex items-center gap-2 font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-500 transition-colors"
                >
                  {item.isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span>Item {index + 1}: {item.serviceName || 'Novo Serviço'}</span>
                  {!item.isExpanded && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({item.hours}h • {item.lineTotal.toFixed(2)}€)
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition text-destructive"
                  title="Remover item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${item.isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Seleção de Serviço */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Serviço
                    </label>
                    <select
                      value={item.serviceId}
                      onChange={(e) => handleServiceChange(item.id, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Horas
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={item.hours || ''}
                      onChange={(e) => handleHoursChange(item.id, parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  {/* Custos de Software */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Custos Software (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.softwareCosts || ''}
                      onChange={(e) => handleSoftwareCostsChange(item.id, parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Preço/Hora (editável) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Preço/Hora (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.hourlyRate || ''}
                      onChange={(e) => handleHourlyRateChange(item.id, parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Base: {Math.round(item.baseCost)}€/h
                    </p>
                  </div>
                </div>

                {/* Margem Desejada (individual por item) */}
                <div className="mt-4 bg-muted/10 rounded-lg p-4">
                  <label                     className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Margem Desejada (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1000"
                      value={item.desiredMargin || 0}
                      onChange={(e) => handleDesiredMarginChange(item.id, parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Esta margem será aplicada sobre o custo base deste item para calcular o preço de venda sugerido.
                    </p>
                    <div className="mt-2 text-xs text-gray-900 dark:text-white">
                      <span>Preço sugerido para este item: </span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {((item.baseCost * item.hours) * (1 + (item.desiredMargin || 0) / 100) + item.softwareCosts).toFixed(2)}€
                      </span>
                    </div>
                </div>

                {/* Resumo do item */}
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Linha</p>
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      {item.lineTotal.toFixed(2)}€
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Margem Linha</p>
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      {item.lineMargin.toFixed(2)}€
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Custo Base</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {(item.baseCost * item.hours).toFixed(2)}€
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Margem</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {item.baseCost > 0
                        ? (((item.hourlyRate - item.baseCost) / item.baseCost) * 100).toFixed(1)
                        : '0.0'
                      }%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

                {items.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <Calculator className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Nenhum item adicionado ainda.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Clique em "Adicionar Item" para começar.</p>
                  </div>
                )}
              </div>

              {/* Botão para adicionar item */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleAddItem}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Item
                </button>
              </div>
            </div>
          )}

          {/* Passo 2: Revisão de Custos e Margens */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Revise os custos e ajuste as margens
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verifique os totais calculados e ajuste o preço de venda final se necessário.
                </p>
              </div>

              {/* Resumo dos itens */}
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Item {index + 1}: {item.serviceName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.hours}h × {item.hourlyRate.toFixed(2)}€/h + {item.softwareCosts.toFixed(2)}€ software
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          {item.lineTotal.toFixed(2)}€
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Margem: {item.desiredMargin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Preço de venda final (editável) */}
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border-2 border-orange-200 dark:border-orange-800">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Preço de Venda Final (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={finalSellingPrice.toFixed(2)}
                  onChange={(e) => setFinalSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-orange-300 dark:border-orange-700 rounded-lg text-orange-600 dark:text-orange-400 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Margem final:</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {totals.marginPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Lucro estimado:</p>
                    <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      {(finalSellingPrice - totals.totalBaseCost - totals.totalSoftwareCosts).toFixed(2)}€
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Passo 3: Dados da Proposta */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Complete os dados da proposta
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Adicione o título, cliente e outras informações para finalizar a proposta.
                </p>
              </div>

              <form id="proposal-form" onSubmit={handleSaveAsProposal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título da Proposta *
                  </label>
                  <input
                    type="text"
                    value={proposalFormData.title}
                    onChange={(e) => setProposalFormData({ ...proposalFormData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Proposta de Serviços Digitais"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cliente
                  </label>
                  <select
                    value={proposalFormData.client_id}
                    onChange={(e) => setProposalFormData({ ...proposalFormData, client_id: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Selecione um cliente</option>
                    {clients?.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.company ? `- ${client.company}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={proposalFormData.description}
                    onChange={(e) => setProposalFormData({ ...proposalFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Descrição da proposta..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={proposalFormData.status}
                      onChange={(e) => setProposalFormData({ ...proposalFormData, status: e.target.value as any })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="sent">Enviada</option>
                      <option value="negotiating">Em Negociação</option>
                      <option value="accepted">Aceite</option>
                      <option value="rejected">Rejeitada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Válida até
                    </label>
                    <input
                      type="date"
                      value={proposalFormData.valid_until}
                      onChange={(e) => setProposalFormData({ ...proposalFormData, valid_until: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={proposalFormData.notes}
                    onChange={(e) => setProposalFormData({ ...proposalFormData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Notas adicionais..."
                  />
                </div>

                {/* Resumo da simulação que será guardada */}
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Resumo da Simulação:</h3>
                  <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                    <p>• {items.length} item(s) será(ão) adicionado(s)</p>
                    <p>• Preço total: {finalSellingPrice.toFixed(2)}€</p>
                    <p>• Margem final: {totals.marginPercentage.toFixed(1)}%</p>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer com botões de navegação */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <button
            type="button"
            onClick={currentStep === 1 ? onClose : handlePreviousStep}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
          >
            {currentStep === 1 ? (
              <>
                <X className="w-4 h-4" />
                Cancelar
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!canGoToNextStep()}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="proposal-form"
                disabled={!proposalFormData.title.trim() || createProposal.isPending || createProposalItem.isPending}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {createProposal.isPending || createProposalItem.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Proposta
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
