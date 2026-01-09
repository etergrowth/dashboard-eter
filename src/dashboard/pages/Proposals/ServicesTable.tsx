import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useAllServices, useCreateService, useUpdateService, useDeleteService } from '../../hooks/useServices';
import type { Service, ServiceInsert } from '../../../types';

export function ServicesTable() {
  const { data: services, isLoading, error } = useAllServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<ServiceInsert>>({
    name: '',
    base_cost_per_hour: 0,
    markup_percentage: 0,
  });

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      base_cost_per_hour: service.base_cost_per_hour,
      markup_percentage: service.markup_percentage,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      name: '',
      base_cost_per_hour: 0,
      markup_percentage: 0,
    });
  };

  const calculatePrice = (cost: number, markup: number) => {
    return cost * (1 + markup / 100);
  };

  const handleSave = async () => {
    if (editingId) {
      const finalRate = calculatePrice(
        formData.base_cost_per_hour || 0,
        formData.markup_percentage || 0
      );
      await updateService.mutateAsync({
        id: editingId,
        name: formData.name!,
        base_cost_per_hour: formData.base_cost_per_hour!,
        markup_percentage: formData.markup_percentage!,
        final_hourly_rate: finalRate,
      });
      setEditingId(null);
    } else if (isAdding) {
      const finalRate = calculatePrice(
        formData.base_cost_per_hour || 0,
        formData.markup_percentage || 0
      );
      const serviceData: ServiceInsert = {
        name: formData.name!,
        base_cost_per_hour: formData.base_cost_per_hour!,
        markup_percentage: formData.markup_percentage!,
        final_hourly_rate: finalRate,
      };
      await createService.mutateAsync(serviceData);
      setIsAdding(false);
    }
    setFormData({
      name: '',
      base_cost_per_hour: 0,
      markup_percentage: 0,
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar o serviço "${name}"?`)) {
      await deleteService.mutateAsync(id);
    }
  };

  const handleChange = (field: keyof ServiceInsert, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calcular média de preço/hora
  const averagePrice = services && services.length > 0
    ? services.reduce((sum, s) => sum + Number(s.final_hourly_rate || 0), 0) / services.length
    : 0;

  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-xl">
        <p className="text-center text-muted-foreground">A carregar serviços...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 rounded-xl">
        <p className="text-center text-destructive">
          Erro ao carregar serviços: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">
          Tabela de Serviços
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="glass-button px-4 py-2 rounded-lg text-secondary-foreground flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar Serviço
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/10 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                Função
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                Custo/Hora (€)
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                Markup (%)
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                Preço/Hora (€)
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && (!services || services.length === 0) && !isAdding && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum serviço encontrado. Adicione o primeiro serviço.
                </td>
              </tr>
            )}
            {isAdding && (
              <tr className="bg-primary/5">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Nome do serviço"
                    className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.base_cost_per_hour || 0}
                    onChange={(e) => handleChange('base_cost_per_hour', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.markup_percentage || 0}
                    onChange={(e) => handleChange('markup_percentage', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="text-card-foreground font-medium">
                    {calculatePrice(
                      formData.base_cost_per_hour || 0,
                      formData.markup_percentage || 0
                    ).toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleSave}
                      disabled={!formData.name || createService.isPending}
                      className="p-2 hover:bg-primary/20 rounded-lg transition text-primary disabled:opacity-50"
                      title="Guardar"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 hover:bg-muted/10 rounded-lg transition text-muted-foreground hover:text-card-foreground"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {services && services.length > 0 && services.map((service) => (
              <tr key={service.id} className="hover:bg-muted/5 transition">
                {editingId === service.id ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.base_cost_per_hour || 0}
                        onChange={(e) => handleChange('base_cost_per_hour', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.markup_percentage || 0}
                        onChange={(e) => handleChange('markup_percentage', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-card-foreground font-medium">
                        {calculatePrice(
                          formData.base_cost_per_hour || 0,
                          formData.markup_percentage || 0
                        ).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={handleSave}
                          disabled={!formData.name || updateService.isPending}
                          className="p-2 hover:bg-primary/20 rounded-lg transition text-primary disabled:opacity-50"
                          title="Guardar"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 hover:bg-muted/10 rounded-lg transition text-muted-foreground hover:text-card-foreground"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">
                      <p className="text-card-foreground font-medium">{service.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-card-foreground">
                        {Number(service.base_cost_per_hour).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-card-foreground">
                        {Number(service.markup_percentage).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-card-foreground font-medium">
                        {Number(service.final_hourly_rate).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 hover:bg-muted/10 rounded-lg transition text-muted-foreground hover:text-card-foreground"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id, service.name)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition text-muted-foreground hover:text-destructive"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {/* Linha de média */}
            {services && services.length > 0 && (
              <tr className="bg-muted/10 border-t-2 border-border font-semibold">
                <td colSpan={3} className="px-4 py-3 text-muted-foreground">
                  Média Preço/Hora
                </td>
                <td className="px-4 py-3">
                  <span className="text-card-foreground font-semibold">
                    {averagePrice.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
