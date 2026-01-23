import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Plus, Edit, Trash2, Save, X, ArrowUpDown } from 'lucide-react';
import { useAllServices, useCreateService, useUpdateService, useDeleteService } from '../../hooks/useServices';
import type { Service, ServiceInsert } from '../../../types';

export function ServicesTable() {
  const { data: services, isLoading } = useAllServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [formData, setFormData] = React.useState<Partial<ServiceInsert>>({
    name: '',
    base_cost_per_hour: 0,
    markup_percentage: 0,
    description: '',
  });

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      base_cost_per_hour: service.base_cost_per_hour,
      markup_percentage: service.markup_percentage,
      description: service.description || '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      name: '',
      base_cost_per_hour: 0,
      markup_percentage: 0,
      description: '',
    });
  };

  const handleSave = async () => {
    if (editingId) {
      await updateService.mutateAsync({
        id: editingId,
        ...formData,
      });
      setEditingId(null);
    } else if (isAdding) {
      const serviceData: ServiceInsert = {
        name: formData.name!,
        base_cost_per_hour: formData.base_cost_per_hour!,
        markup_percentage: formData.markup_percentage!,
        description: formData.description || null,
        final_hourly_rate: (formData.base_cost_per_hour || 0) * (1 + (formData.markup_percentage || 0) / 100),
      };
      await createService.mutateAsync(serviceData);
      setIsAdding(false);
    }
    setFormData({
      name: '',
      base_cost_per_hour: 0,
      markup_percentage: 0,
      description: '',
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

  const columns: ColumnDef<Service>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span>Função</span>
              <ArrowUpDown className="h-4 w-4 flex-shrink-0" />
            </button>
          );
        },
        cell: ({ row }) => {
          const service = row.original;
          if (editingId === service.id) {
            return (
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            );
          }
          return (
            <div>
              <p className="text-card-foreground font-medium">{service.name}</p>
              {service.description && (
                <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "base_cost_per_hour",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span>Custo/Hora (€)</span>
              <ArrowUpDown className="h-4 w-4 flex-shrink-0" />
            </button>
          );
        },
        cell: ({ row }) => {
          const service = row.original;
          if (editingId === service.id) {
            return (
              <input
                type="number"
                step="0.01"
                value={formData.base_cost_per_hour || 0}
                onChange={(e) => handleChange('base_cost_per_hour', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            );
          }
          return <span className="text-card-foreground">{Math.round(Number(service.base_cost_per_hour))}</span>;
        },
      },
      {
        accessorKey: "markup_percentage",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span>Markup (%)</span>
              <ArrowUpDown className="h-4 w-4 flex-shrink-0" />
            </button>
          );
        },
        cell: ({ row }) => {
          const service = row.original;
          if (editingId === service.id) {
            return (
              <input
                type="number"
                step="0.01"
                value={formData.markup_percentage || 0}
                onChange={(e) => handleChange('markup_percentage', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            );
          }
          return <span className="text-card-foreground">{Math.round(Number(service.markup_percentage))}</span>;
        },
      },
      {
        accessorKey: "final_hourly_rate",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span>Preço/Hora (€)</span>
              <ArrowUpDown className="h-4 w-4 flex-shrink-0" />
            </button>
          );
        },
        cell: ({ row }) => {
          const service = row.original;
          if (editingId === service.id) {
            return (
              <span className="text-card-foreground font-medium">
                {Math.round((formData.base_cost_per_hour || 0) * (1 + (formData.markup_percentage || 0) / 100))}
              </span>
            );
          }
          return (
            <span className="text-card-foreground font-medium">
              {Math.round(Number(service.final_hourly_rate))}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Ações</div>,
        cell: ({ row }) => {
          const service = row.original;
          if (editingId === service.id) {
            return (
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
            );
          }
          return (
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
          );
        },
        enableHiding: false,
      },
    ],
    [editingId, formData, updateService.isPending]
  );

  const table = useReactTable({
    data: services || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-xl">
        <p className="text-center text-muted-foreground">A carregar serviços...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl transition-all duration-300 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-card-foreground">
          Tabela de Serviços
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="glass-button px-4 py-2 rounded-lg text-secondary-foreground flex items-center gap-2 text-sm font-medium hover:bg-primary/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Serviço
          </button>
        )}
      </div>

      <div>
        <div className="flex items-center py-4">
          <input
            placeholder="Filtrar serviços..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        <div className="overflow-hidden rounded-md border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/10 border-b border-border">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground whitespace-nowrap"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border">
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
                        {Math.round((formData.base_cost_per_hour || 0) * (1 + (formData.markup_percentage || 0) / 100))}
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-muted/5 transition"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-3"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Nenhum serviço encontrado.
                    </td>
                  </tr>
                )}
                {/* Linha de média */}
                {services && services.length > 0 && (
                  <tr className="bg-muted/10 border-t-2 border-border font-semibold">
                    <td colSpan={3} className="px-4 py-3 text-muted-foreground">
                      Média Preço/Hora
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-card-foreground font-semibold">
                        {Math.round(averagePrice)}
                      </span>
                    </td>
                    <td className="px-4 py-3"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} serviço(s) encontrado(s).
          </div>
          <div className="space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 text-sm bg-muted/10 border border-border rounded-lg hover:bg-muted/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-card-foreground"
            >
              Anterior
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 text-sm bg-muted/10 border border-border rounded-lg hover:bg-muted/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-card-foreground"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
