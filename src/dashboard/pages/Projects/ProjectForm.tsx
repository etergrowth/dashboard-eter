import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useCreateProject, useUpdateProject } from '../../hooks/useProjects';
import { useClients } from '../../hooks/useClients';
import type { ProjectInsert, Project } from '../../../types';

interface ProjectFormProps {
  onClose: () => void;
  project?: Project;
}

export function ProjectForm({ onClose, project }: ProjectFormProps) {
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { data: clients } = useClients();

  const [formData, setFormData] = useState<Partial<ProjectInsert>>({
    name: project?.name || '',
    description: project?.description || '',
    client_id: project?.client_id || null,
    status: project?.status || 'planning',
    start_date: project?.start_date || null,
    end_date: project?.end_date || null,
    budget: project?.budget || null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === '' ? null : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const projectData: ProjectInsert = {
      name: formData.name!,
      description: formData.description || null,
      client_id: formData.client_id || null,
      status: formData.status || 'planning',
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      budget: formData.budget ? Number(formData.budget) : null,
      user_id: '', // Será definido automaticamente pelo hook usando auth.uid()
    };

    if (project) {
      updateProject.mutate(
        { id: project.id, ...projectData },
        { onSuccess: () => onClose() }
      );
    } else {
      createProject.mutate(projectData, { onSuccess: () => onClose() });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">
            {project ? 'Editar Projeto' : 'Novo Projeto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-xl transition text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Informacao Basica</h3>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome do Projeto *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                placeholder="Website Institucional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descricao
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                placeholder="Descricao detalhada do projeto..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cliente
              </label>
              <select
                name="client_id"
                value={formData.client_id || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              >
                <option value="">Sem cliente associado</option>
                {clients?.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company && `(${client.company})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Detalhes do Projeto</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                >
                  <option value="planning">Planeamento</option>
                  <option value="active">Em Progresso</option>
                  <option value="on_hold">Pausado</option>
                  <option value="completed">Concluido</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Data de Inicio
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Data de Fim
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Orcamento (EUR)
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget || ''}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={createProject.isPending || updateProject.isPending}
              className="flex-1 bg-primary hover:bg-primary/90 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createProject.isPending || updateProject.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {project ? 'Atualizar Projeto' : 'Criar Projeto'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
