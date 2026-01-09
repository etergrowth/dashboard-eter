import { useState } from 'react';
import { Briefcase, Plus, Trash2, Edit, Calendar, DollarSign, Eye } from 'lucide-react';
import { useProjects, useDeleteProject } from '../../hooks/useProjects';
import { ProjectForm } from './ProjectForm';
import { KanbanBoard } from './KanbanBoard';
import type { Project } from '../../../types';
import { PageHeader, StatsGrid, ActionButton, EmptyState, LoadingState } from '../../components/sections';

export function Projects() {
  const { data: projects, isLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar "${name}"?`)) {
      deleteProject.mutate(id);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'on_hold':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };


  const stats = [
    {
      name: 'Total Projetos',
      value: projects?.length || 0,
    },
    {
      name: 'Em Progresso',
      value: projects?.filter((p) => p.status === 'active').length || 0,
    },
    {
      name: 'Concluídos',
      value: projects?.filter((p) => p.status === 'completed').length || 0,
    },
    {
      name: 'Planeamento',
      value: projects?.filter((p) => p.status === 'planning').length || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projetos"
        description="Gestão de projetos e tarefas"
        action={
          <ActionButton
            label="Novo Projeto"
            onClick={() => setShowForm(true)}
            icon={Plus}
          />
        }
      />

      <StatsGrid stats={stats} columns={4} />

      {/* Projects List */}
      {isLoading ? (
        <LoadingState message="A carregar projetos..." />
      ) : projects && projects.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="glass-panel p-5 rounded-xl hover:bg-white/5 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </div>

                  {project.budget && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      €{Number(project.budget).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                    </div>
                  )}

                  {project.end_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.end_date).toLocaleDateString('pt-PT')}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex-1 px-3 py-2 bg-[#7BA8F9]/20 hover:bg-[#7BA8F9]/30 rounded-lg transition text-white text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Kanban
                  </button>
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition text-gray-400 hover:text-red-400"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Kanban Board for Selected Project */}
          {selectedProject && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Kanban: {selectedProject.name}
                </h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="glass-button px-4 py-2 rounded-lg text-white hover:bg-[#7BA8F9]/20 transition"
                >
                  Fechar Kanban
                </button>
              </div>
              <KanbanBoard projectId={selectedProject.id} />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="Nenhum projeto criado"
          description="Crie o seu primeiro projeto e organize tarefas com o Kanban board."
          action={
            <ActionButton
              label="Criar Primeiro Projeto"
              onClick={() => setShowForm(true)}
              icon={Plus}
            />
          }
        />
      )}

      {/* Project Form Modal */}
      {showForm && <ProjectForm onClose={handleCloseForm} project={editingProject} />}
    </div>
  );
}
