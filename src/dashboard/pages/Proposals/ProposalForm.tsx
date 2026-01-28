import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useCreateProposal, useUpdateProposal } from '../../hooks/useProposals';
import { useClients } from '../../hooks/useClients';
import { useIsMobile } from '../../../hooks/use-mobile';
import type { ProposalInsert, Proposal } from '../../../types';

interface ProposalFormProps {
  onClose: () => void;
  proposal?: Proposal;
}

export function ProposalForm({ onClose, proposal }: ProposalFormProps) {
  const createProposal = useCreateProposal();
  const updateProposal = useUpdateProposal();
  const { data: clients } = useClients();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState<Partial<ProposalInsert>>({
    title: proposal?.title || '',
    description: proposal?.description || '',
    client_id: proposal?.client_id || undefined,
    status: proposal?.status || 'draft',
    valid_until: proposal?.valid_until || undefined,
    notes: proposal?.notes || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (proposal) {
      updateProposal.mutate(
        { id: proposal.id, ...formData },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      const proposalData: ProposalInsert = {
        title: formData.title!,
        description: formData.description || null,
        client_id: formData.client_id || null,
        status: formData.status || 'draft',
        valid_until: formData.valid_until || null,
        notes: formData.notes || null,
      };

      createProposal.mutate(proposalData, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const isLoading = createProposal.isPending || updateProposal.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 md:p-4">
      <div className={`bg-gray-900 shadow-xl w-full ${isMobile ? 'max-w-full mx-0 rounded-t-3xl' : 'max-w-2xl rounded-lg'} max-h-[90vh] overflow-y-auto`}>
        <div className={`sticky top-0 bg-gray-900 border-b border-gray-800 ${isMobile ? 'p-4' : 'p-6'} flex items-center justify-between`}>
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white`}>
            {proposal ? 'Editar Proposta' : 'Nova Proposta'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`${isMobile ? 'p-4 space-y-3' : 'p-6 space-y-4'}`}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título da Proposta *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Proposta de Serviços Digitais"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cliente
            </label>
            <select
              name="client_id"
              value={formData.client_id || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrição da proposta..."
            />
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Rascunho</option>
                <option value="sent">Enviada</option>
                <option value="negotiating">Em Negociação</option>
                <option value="accepted">Aceite</option>
                <option value="rejected">Rejeitada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Válida até
              </label>
              <input
                type="date"
                name="valid_until"
                value={formData.valid_until || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionais..."
            />
          </div>

          <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-end gap-3'} pt-4 border-t border-gray-800`}>
            <button
              type="button"
              onClick={onClose}
              className={`${isMobile ? 'w-full' : ''} px-4 py-2 text-gray-400 hover:text-white transition-colors`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`${isMobile ? 'w-full' : ''} px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}