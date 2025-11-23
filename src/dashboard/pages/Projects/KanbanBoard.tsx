import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useProjectTasks, useCreateProjectTask, useUpdateProjectTask, useDeleteProjectTask } from '../../hooks/useProjects';
import type { ProjectTask, ProjectTaskInsert } from '../../../types';

interface KanbanBoardProps {
  projectId: string;
}

const COLUMNS = [
  { id: 'todo', title: 'A Fazer', color: 'bg-blue-500/20 border-blue-500/30' },
  { id: 'doing', title: 'Em Progresso', color: 'bg-yellow-500/20 border-yellow-500/30' },
  { id: 'done', title: 'Concluído', color: 'bg-green-500/20 border-green-500/30' },
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
      assigned_to: null,
      due_date: null,
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((column) => (
        <div
          key={column.id}
          className="glass-panel p-4 rounded-xl"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          {/* Column Header */}
          <div className={`border rounded-lg p-3 mb-4 ${column.color}`}>
            <h3 className="font-semibold text-white flex items-center justify-between">
              <span>{column.title}</span>
              <span className="text-sm bg-white/10 px-2 py-1 rounded">
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
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7BA8F9] focus:border-transparent transition"
              />
              <button
                onClick={() => handleCreateTask(column.id)}
                className="p-2 glass-button rounded-lg hover:bg-[#7BA8F9]/20 transition"
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
                className="bg-white/5 border border-white/10 rounded-lg p-3 cursor-move hover:bg-white/10 transition group"
              >
                <div className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium break-words">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-gray-400 text-xs mt-1 break-words">
                        {task.description}
                      </p>
                    )}
                    {task.due_date && (
                      <p className="text-xs text-gray-500 mt-2">
                        📅 {new Date(task.due_date).toLocaleDateString('pt-PT')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded transition text-gray-400 hover:text-red-400"
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
