import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useProjectTasks, useCreateProjectTask, useUpdateProjectTask, useDeleteProjectTask } from '../../hooks/useProjects';
import type { ProjectTask, ProjectTaskInsert } from '../../../types';

interface KanbanBoardProps {
  projectId: string;
}

const COLUMNS = [
  { id: 'todo', title: 'A Fazer', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', badgeColor: 'bg-blue-100 text-blue-700' },
  { id: 'doing', title: 'Em Progresso', color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700', badgeColor: 'bg-amber-100 text-amber-700' },
  { id: 'done', title: 'Concluido', color: 'bg-green-50 border-green-200', textColor: 'text-green-700', badgeColor: 'bg-green-100 text-green-700' },
] as const;

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { data: tasks } = useProjectTasks(projectId);
  const createTask = useCreateProjectTask();
  const updateTask = useUpdateProjectTask();
  const deleteTask = useDeleteProjectTask();

  const [newTaskTitle, setNewTaskTitle] = useState<{ [key: string]: string }>({});
  const [draggedTask, setDraggedTask] = useState<ProjectTask | null>(null);

  const getTasksByColumn = (columnId: string) => {
    return tasks?.filter((task) => task.kanban_column === columnId) || [];
  };

  const handleCreateTask = (columnId: string) => {
    const title = newTaskTitle[columnId]?.trim();
    if (!title) return;

    const position = getTasksByColumn(columnId).length;

    const taskData: ProjectTaskInsert = {
      project_id: projectId,
      title,
      kanban_column: columnId as 'todo' | 'doing' | 'done',
      position,
      description: null,
      user_id: '', // Will be set by the hook
    };

    createTask.mutate(taskData, {
      onSuccess: () => {
        setNewTaskTitle((prev) => ({ ...prev, [columnId]: '' }));
      },
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar esta tarefa?')) {
      deleteTask.mutate(taskId);
    }
  };

  const handleDragStart = (task: ProjectTask) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnId: string) => {
    if (!draggedTask) return;

    if (draggedTask.kanban_column !== columnId) {
      const position = getTasksByColumn(columnId).length;
      updateTask.mutate({
        id: draggedTask.id,
        kanban_column: columnId as 'todo' | 'doing' | 'done',
        position,
      });
    }

    setDraggedTask(null);
  };

  return (
    <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0">
      {COLUMNS.map((column) => (
        <div
          key={column.id}
          className="min-w-[280px] md:min-w-0 snap-center md:snap-align-none bg-white border border-border rounded-2xl p-3 md:p-4 shadow-sm flex-shrink-0"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          {/* Column Header */}
          <div className={`border rounded-xl p-3 mb-4 ${column.color}`}>
            <h3 className={`font-semibold flex items-center justify-between ${column.textColor}`}>
              <span>{column.title}</span>
              <span className={`text-sm px-2.5 py-1 rounded-full font-bold ${column.badgeColor}`}>
                {getTasksByColumn(column.id).length}
              </span>
            </h3>
          </div>

          {/* Add Task Form */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle[column.id] || ''}
                onChange={(e) =>
                  setNewTaskTitle((prev) => ({ ...prev, [column.id]: e.target.value }))
                }
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateTask(column.id);
                  }
                }}
                placeholder="Nova tarefa..."
                className="flex-1 px-3 py-2.5 bg-secondary border border-border rounded-xl text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              <button
                onClick={() => handleCreateTask(column.id)}
                className="p-2.5 bg-primary hover:bg-primary/90 rounded-xl text-white transition"
                title="Adicionar"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-2 min-h-[200px]">
            {getTasksByColumn(column.id).map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task)}
                className="bg-secondary border border-border rounded-xl p-3 cursor-move hover:border-primary/30 hover:shadow-sm transition group"
              >
                <div className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-medium break-words">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-muted-foreground text-xs mt-1 break-words">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition text-muted-foreground hover:text-red-600"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
