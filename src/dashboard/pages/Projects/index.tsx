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
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'active':
      case 'in_progress':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'on_hold':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning':
        return 'Planeamento';
      case 'active':
      case 'in_progress':
        return 'Em Progresso';
      case 'on_hold':
        return 'Pausado';
      case 'completed':
        return 'Concluido';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
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
              <div key={project.id} className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}
                    >
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  {project.budget && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-foreground">
                        {Number(project.budget).toLocaleString('pt-PT', { minimumFractionDigits: 2, style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                  )}

                  {project.end_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(project.end_date).toLocaleDateString('pt-PT')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 rounded-xl transition text-white text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Kanban
                  </button>
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2.5 hover:bg-secondary rounded-xl transition text-muted-foreground hover:text-foreground"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    className="p-2.5 hover:bg-red-50 rounded-xl transition text-muted-foreground hover:text-red-600"
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
              <div className="flex items-center justify-between bg-white border border-border rounded-2xl p-4 shadow-sm">
                <h2 className="text-xl font-bold text-foreground">
                  Kanban: {selectedProject.name}
                </h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-foreground font-medium transition"
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
