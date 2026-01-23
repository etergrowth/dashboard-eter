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
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronUp, ArrowUpDown, Eye, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProposals, useCreateProposal, useUpdateProposal, useDeleteProposal } from '../../hooks/useProposals';
import type { Proposal, ProposalInsert } from '../../../types';
import { Badge } from '../../../components/ui/badge';
import { Checkbox } from '../../../components/ui/checkbox';
import { convertToCSV, downloadCSV } from '../../../utils/export';

interface ProposalsTableProps {
  onAddProposal?: () => void;
}

export function ProposalsTable({ onAddProposal }: ProposalsTableProps = {}) {
  const navigate = useNavigate();
  const { data: proposals, isLoading } = useProposals();
  const createProposal = useCreateProposal();
  const updateProposal = useUpdateProposal();
  const deleteProposal = useDeleteProposal();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [formData, setFormData] = React.useState<Partial<ProposalInsert>>({
    title: '',
    description: '',
    status: 'draft',
    client_id: null,
    total_amount: null,
    total_margin: null,
    valid_until: null,
    notes: null,
  });

  const handleEdit = (proposal: Proposal) => {
    setEditingId(proposal.id);
    setFormData({
      title: proposal.title,
      description: proposal.description || '',
      status: proposal.status || 'draft',
      client_id: proposal.client_id,
      total_amount: proposal.total_amount,
      total_margin: proposal.total_margin,
      valid_until: proposal.valid_until || null,
      notes: proposal.notes || null,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      title: '',
      description: '',
      status: 'draft',
      client_id: null,
      total_amount: null,
      total_margin: null,
      valid_until: null,
      notes: null,
    });
  };

  const handleSave = async () => {
    if (editingId) {
      await updateProposal.mutateAsync({
        id: editingId,
        ...formData,
      });
      setEditingId(null);
    } else if (isAdding) {
      const proposalData: ProposalInsert = {
        title: formData.title!,
        description: formData.description || null,
        status: formData.status || 'draft',
        client_id: formData.client_id || null,
        total_amount: formData.total_amount || null,
        total_margin: formData.total_margin || null,
        valid_until: formData.valid_until || null,
        notes: formData.notes || null,
        user_id: 'local-user', // Will be replaced with actual user ID later
      };
      await createProposal.mutateAsync(proposalData);
      setIsAdding(false);
    }
    setFormData({
      title: '',
      description: '',
      status: 'draft',
      client_id: null,
      total_amount: null,
      total_margin: null,
      valid_until: null,
      notes: null,
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar a proposta "${title}"?`)) {
      await deleteProposal.mutateAsync(id);
    }
  };

  const handleChange = (field: keyof ProposalInsert, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'sent':
        return 'Enviada';
      case 'negotiating':
        return 'Em Negociação';
      case 'accepted':
        return 'Aceite';
      case 'rejected':
        return 'Rejeitada';
      default:
        return status || 'Rascunho';
    }
  };

  const getStatusBadge = (status: string | null) => {
    const label = getStatusLabel(status);
    switch (status) {
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/30">
            {label}
          </Badge>
        );
      case 'sent':
        return (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {label}
          </Badge>
        );
      case 'negotiating':
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            {label}
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            {label}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
            {label}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/30">
            {label}
          </Badge>
        );
    }
  };

  const columns: ColumnDef<Proposal & { client?: { name: string; company: string | null } | null }>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecionar todas"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Selecionar linha"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "title",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span>Título</span>
              <ArrowUpDown className="h-4 w-4 flex-shrink-0" />
            </button>
          );
        },
        cell: ({ row }) => {
          const proposal = row.original;
          if (editingId === proposal.id) {
            return (
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            );
          }
          return (
            <div>
              <p className="text-card-foreground font-medium">{proposal.title}</p>
              {proposal.description && (
                <p className="text-xs text-muted-foreground mt-1">{proposal.description}</p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "client",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span>Cliente</span>
              <ArrowUpDown className="h-4 w-4 flex-shrink-0" />
            </button>
          );
        },
        cell: ({ row }) => {
          const proposal = row.original;
          if (editingId === proposal.id) {
            return (
              <span className="text-muted-foreground text-sm">Editar no formulário</span>
            );
          }
          return (
            <span className="text-card-foreground">
              {proposal.client?.name || 'Sem cliente'}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span>Estado</span>
              <ArrowUpDown className="h-4 w-4 flex-shrink-0" />
            </button>
          );
        },
        cell: ({ row }) => {
          const proposal = row.original;
          if (editingId === proposal.id) {
            return (
              <select
                value={formData.status || 'draft'}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="draft">Rascunho</option>
                <option value="sent">Enviada</option>
                <option value="negotiating">Em Negociação</option>
                <option value="accepted">Aceite</option>
                <option value="rejected">Rejeitada</option>
              </select>
            );
          }
          return getStatusBadge(proposal.status);
        },
      },
      {
        accessorKey: "total_amount",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span>Total (€)</span>
              <ArrowUpDown className="h-4 w-4 flex-shrink-0" />
            </button>
          );
        },
        cell: ({ row }) => {
          const proposal = row.original;
          if (editingId === proposal.id) {
            return (
              <input
                type="number"
                step="0.01"
                value={formData.total_amount || ''}
                onChange={(e) => handleChange('total_amount', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            );
          }
          return (
            <span className="text-card-foreground font-medium">
              {proposal.total_amount?.toFixed(2) || '0.00'}€
            </span>
          );
        },
      },
      {
        accessorKey: "total_margin",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span>Margem (€)</span>
              <ArrowUpDown className="h-4 w-4 flex-shrink-0" />
            </button>
          );
        },
        cell: ({ row }) => {
          const proposal = row.original;
          if (editingId === proposal.id) {
            return (
              <input
                type="number"
                step="0.01"
                value={formData.total_margin || ''}
                onChange={(e) => handleChange('total_margin', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            );
          }
          return (
            <span className="text-card-foreground font-medium">
              {proposal.total_margin?.toFixed(2) || '0.00'}€
            </span>
          );
        },
      },
      {
        accessorKey: "valid_until",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-primary transition-colors whitespace-nowrap"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span>Válida até</span>
              <ArrowUpDown className="h-4 w-4 flex-shrink-0" />
            </button>
          );
        },
        cell: ({ row }) => {
          const proposal = row.original;
          if (editingId === proposal.id) {
            return (
              <input
                type="date"
                value={formData.valid_until ? new Date(formData.valid_until).toISOString().split('T')[0] : ''}
                onChange={(e) => handleChange('valid_until', e.target.value || null)}
                className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            );
          }
          return (
            <span className="text-card-foreground">
              {proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString('pt-PT') : '-'}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Ações</div>,
        cell: ({ row }) => {
          const proposal = row.original;
          if (editingId === proposal.id) {
            return (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleSave}
                  disabled={!formData.title || updateProposal.isPending}
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
                onClick={() => navigate(`/dashboard/proposals/${proposal.id}`)}
                className="p-2 hover:bg-muted/10 rounded-lg transition text-muted-foreground hover:text-card-foreground"
                title="Ver detalhes"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(proposal.id, proposal.title)}
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
    [editingId, formData, updateProposal.isPending]
  );

  const table = useReactTable({
    data: proposals || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleBulkDelete = async () => {
    const selectedRowIds = Object.keys(rowSelection);
    if (selectedRowIds.length === 0) return;
    
    // Get proposal IDs from selected rows
    const selectedProposalIds = table.getRowModel().rows
      .filter(row => rowSelection[row.id])
      .map(row => row.original.id);
    
    if (selectedProposalIds.length === 0) return;
    
    if (window.confirm(`Tem a certeza que deseja eliminar ${selectedProposalIds.length} proposta(s)?`)) {
      try {
        await Promise.all(selectedProposalIds.map(id => deleteProposal.mutateAsync(id)));
        setRowSelection({});
      } catch (error) {
        console.error('Erro ao eliminar propostas:', error);
        alert('Erro ao eliminar algumas propostas. Por favor, tente novamente.');
      }
    }
  };

  const handleBulkStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    if (!status) return;
    
    const selectedRowIds = Object.keys(rowSelection);
    if (selectedRowIds.length === 0) return;

    // Get proposal IDs from selected rows
    const selectedProposalIds = table.getRowModel().rows
      .filter(row => rowSelection[row.id])
      .map(row => row.original.id);

    if (selectedProposalIds.length === 0) return;

    try {
      await Promise.all(
        selectedProposalIds.map(id => updateProposal.mutateAsync({ id, status }))
      );
      setRowSelection({});
      e.target.value = '';
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status. Por favor, tente novamente.');
    }
  };

  const handleBulkExport = () => {
    const selectedRowIds = Object.keys(rowSelection);
    if (selectedRowIds.length === 0) {
      alert('Selecione pelo menos uma proposta para exportar.');
      return;
    }

    // Get selected proposals by matching row IDs with proposal indices
    const selectedProposals = table.getRowModel().rows
      .filter(row => rowSelection[row.id])
      .map(row => row.original) || [];
    
    if (selectedProposals.length === 0) {
      alert('Nenhuma proposta encontrada para exportar.');
      return;
    }

    const csv = convertToCSV(selectedProposals);
    downloadCSV(csv, `propostas_${new Date().toISOString().split('T')[0]}.csv`);
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-xl">
        <p className="text-center text-muted-foreground">A carregar propostas...</p>
      </div>
    );
  }

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-card-foreground">Tabela de Propostas</h2>
        {!isAdding && (
          <button
            onClick={() => {
              if (onAddProposal) {
                onAddProposal();
              } else {
                setIsAdding(true);
              }
            }}
            className="glass-button px-4 py-2 rounded-lg text-secondary-foreground flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar Proposta
          </button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg mb-4 border border-primary/20">
          <span className="text-sm font-medium text-card-foreground">
            {selectedCount} proposta(s) selecionada(s)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              disabled={deleteProposal.isPending}
              className="px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition text-sm font-medium disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Apagar
            </button>
            <select
              onChange={handleBulkStatusChange}
              defaultValue=""
              className="px-4 py-2 bg-secondary border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="">Mudar status...</option>
              <option value="draft">Rascunho</option>
              <option value="sent">Enviada</option>
              <option value="negotiating">Em Negociação</option>
              <option value="accepted">Aceite</option>
              <option value="rejected">Rejeitada</option>
            </select>
            <button
              onClick={handleBulkExport}
              className="px-4 py-2 bg-secondary hover:bg-accent text-foreground rounded-lg transition text-sm font-medium flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center py-4">
          <input
            placeholder="Filtrar propostas..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
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
                      {/* Checkbox column - empty for new row */}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Título da proposta"
                        className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted-foreground text-sm">Selecionar no formulário</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={formData.status || 'draft'}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      >
                        <option value="draft">Rascunho</option>
                        <option value="sent">Enviada</option>
                        <option value="negotiating">Em Negociação</option>
                        <option value="accepted">Aceite</option>
                        <option value="rejected">Rejeitada</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.total_amount || ''}
                        onChange={(e) => handleChange('total_amount', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.total_margin || ''}
                        onChange={(e) => handleChange('total_margin', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={formData.valid_until ? new Date(formData.valid_until).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleChange('valid_until', e.target.value || null)}
                        className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={handleSave}
                          disabled={!formData.title || createProposal.isPending}
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
                      Nenhuma proposta encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} proposta(s) encontrada(s).
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
