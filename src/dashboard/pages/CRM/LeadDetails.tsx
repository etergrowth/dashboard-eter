import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Trash2,
    Plus,
    Calendar,
    MapPin,
    Building2,
    Mail,
    Phone,
    Sparkles,
    Loader2,
    MessageSquare,
    MoreVertical,
    Edit2
} from 'lucide-react';
import { useClients, useUpdateClient, useDeleteClient } from '../../hooks/useClients';
import { supabase } from '../../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export function LeadDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: clients, isLoading: clientsLoading } = useClients();
    const updateClient = useUpdateClient();
    const deleteClient = useDeleteClient();

    const client = clients?.find(c => c.id === id);
    const [interactions, setInteractions] = useState<any[]>([]);
    const [loadingInteractions, setLoadingInteractions] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showInteractionModal, setShowInteractionModal] = useState(false);
    const [editingInteraction, setEditingInteraction] = useState<any>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [newInteraction, setNewInteraction] = useState({
        title: '',
        description: '',
        location: '',
        type: 'note',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (id) {
            fetchInteractions();
        }
    }, [id]);

    const fetchInteractions = async () => {
        setLoadingInteractions(true);
        const { data, error } = await supabase
            .from('interactions')
            .select('*')
            .eq('client_id', id || '')
            .order('date', { ascending: false });

        if (error) console.error(error);
        else setInteractions(data || []);
        setLoadingInteractions(false);
    };

    const handleRunAIAnalysis = async () => {
        if (!client) return;
        setIsAnalyzing(true);

        try {
            // Prompt OpenAI via Edge Function or direct call if key is available
            // The user mentioned VITE_OPENAI_API_KEY in .env.local
            // For now, let's assume we have an Edge Function 'analyze-lead'
            const { data, error } = await supabase.functions.invoke('analyze-lead', {
                body: {
                    client: {
                        name: client.name,
                        company: client.company,
                        notes: client.notes,
                        sector: client.sector,
                        revenue: client.revenue,
                        investment: client.investment,
                        main_objective: client.main_objective,
                        interactions: interactions.map(i => i.description).join('\n')
                    }
                }
            });

            if (error) throw error;

            await updateClient.mutateAsync({
                id: client.id,
                ai_analysis: data.analysis,
                ai_score: data.score,
                urgency: data.urgency
            } as any);

        } catch (err) {
            console.error(err);
            alert('Erro na análise IA. Verifique se a Edge Function está configurada.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddInteraction = async () => {
        if (!id || !newInteraction.title) return;

        const { error } = await supabase
            .from('interactions')
            .insert([{
                client_id: id,
                user_id: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000',
                ...newInteraction
            }] as any);

        if (error) {
            alert('Erro ao adicionar interação');
        } else {
            setShowInteractionModal(false);
            setEditingInteraction(null);
            setNewInteraction({
                title: '',
                description: '',
                location: '',
                type: 'note',
                date: new Date().toISOString().split('T')[0]
            });
            fetchInteractions();
        }
    };

    const handleEditInteraction = (interaction: any) => {
        setEditingInteraction(interaction);
        setNewInteraction({
            title: interaction.title,
            description: interaction.description || '',
            location: interaction.location || '',
            type: interaction.type,
            date: interaction.date.split('T')[0]
        });
        setShowInteractionModal(true);
        setActiveMenu(null);
    };

    const handleUpdateInteraction = async () => {
        if (!editingInteraction || !newInteraction.title) return;

        const { error } = await supabase
            .from('interactions')
            .update({
                title: newInteraction.title,
                description: newInteraction.description,
                location: newInteraction.location,
                type: newInteraction.type,
                date: newInteraction.date
            })
            .eq('id', editingInteraction.id);

        if (error) {
            alert('Erro ao atualizar interação');
        } else {
            setShowInteractionModal(false);
            setEditingInteraction(null);
            setNewInteraction({
                title: '',
                description: '',
                location: '',
                type: 'note',
                date: new Date().toISOString().split('T')[0]
            });
            fetchInteractions();
        }
    };

    const handleDeleteInteraction = async (interactionId: string) => {
        if (!window.confirm('Tem a certeza que deseja eliminar esta interação?')) return;

        const { error } = await supabase
            .from('interactions')
            .delete()
            .eq('id', interactionId);

        if (error) {
            alert('Erro ao eliminar interação');
        } else {
            fetchInteractions();
        }
        setActiveMenu(null);
    };

    const handleDelete = () => {
        if (window.confirm('Tem a certeza que deseja eliminar este lead?')) {
            deleteClient.mutate(id!, {
                onSuccess: () => navigate('/dashboard/crm')
            });
        }
    };

    if (clientsLoading || !client) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pb-20"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/dashboard/crm')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span>Voltar ao CRM</span>
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handleDelete}
                        className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition-all"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Client Profile */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${client.source === 'website' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'
                                }`}>
                                {client.source === 'website' ? 'Vindo do Site' : 'Input Manual'}
                            </span>
                        </div>

                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/5">
                                <span className="text-3xl font-bold text-primary uppercase">{client.name.charAt(0)}</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">{client.name}</h2>
                                <p className="text-primary text-sm font-medium">{client.sector || 'Tecnologia'}</p>
                            </div>
                        </div>

                        <div className="mt-10 space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-secondary rounded-2xl border border-border">
                                <Mail className="text-primary" size={18} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email</p>
                                    <p className="text-sm text-foreground truncate">{client.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-secondary rounded-2xl border border-border">
                                <Phone className="text-primary" size={18} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Telefone</p>
                                    <p className="text-sm text-foreground">{client.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-secondary rounded-2xl border border-border">
                                <Building2 className="text-primary" size={18} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Empresa</p>
                                    <p className="text-sm text-foreground">{client.company || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats/Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-panel p-6 rounded-3xl border border-border">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Faturamento</p>
                            <p className="text-lg font-bold text-foreground">{client.revenue || 'N/A'}</p>
                        </div>
                        <div className="glass-panel p-6 rounded-3xl border border-border">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Investimento</p>
                            <p className="text-lg font-bold text-foreground">{client.investment || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Right Col: AI & Interactions */}
                <div className="lg:col-span-2 space-y-6">
                    {/* AI Analysis Cards */}
                    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <div className="flex flex-col items-center justify-center w-20 h-20 bg-secondary rounded-2xl border border-border">
                                <span className="text-2xl font-bold text-foreground">{client.ai_score || 0}</span>
                                <span className="text-[8px] text-muted-foreground font-bold tracking-widest uppercase">Score</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-primary">
                                <Sparkles size={24} />
                                <h3 className="text-xl font-bold text-foreground">Análise da IA</h3>
                            </div>

                            <div className="min-h-[100px] text-muted-foreground text-sm leading-relaxed">
                                {client.ai_analysis ? (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        {client.ai_analysis}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full space-y-4 py-4">
                                        <p>Nenhuma análise realizada ainda.</p>
                                        <button
                                            onClick={handleRunAIAnalysis}
                                            disabled={isAnalyzing}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-xs transition-all hover:scale-105 disabled:opacity-50"
                                        >
                                            {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                            EXECUTAR ANÁLISE IA
                                        </button>
                                    </div>
                                )}
                            </div>

                            {client.ai_analysis && (
                                <div className="flex items-center gap-3 pt-4">
                                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${client.urgency === 'alta' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        client.urgency === 'media' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                            'bg-secondary text-muted-foreground border-border'
                                        }`}>
                                        Urgência: {client.urgency || 'baixa'}
                                    </span>
                                    <button
                                        onClick={handleRunAIAnalysis}
                                        disabled={isAnalyzing}
                                        className="text-[10px] font-bold text-primary hover:underline underline-offset-4 uppercase tracking-widest flex items-center gap-1"
                                    >
                                        {isAnalyzing ? <Loader2 className="animate-spin" size={10} /> : <Sparkles size={10} />}
                                        Recalcular
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Interactions / History */}
                    <div className="glass-panel rounded-3xl overflow-hidden flex flex-col h-[500px]">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="text-primary" size={20} />
                                <h3 className="text-xl font-bold text-foreground">Histórico de Interações</h3>
                            </div>
                            <button
                                onClick={() => setShowInteractionModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent text-foreground rounded-xl border border-border transition-all text-xs font-bold"
                            >
                                <Plus size={14} />
                                NOVA INTERAÇÃO
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/30">
                            {loadingInteractions ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="animate-spin text-gray-600" size={24} />
                                </div>
                            ) : interactions.length > 0 ? (
                                interactions.map((interaction) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={interaction.id}
                                        className="glass-panel p-6 rounded-2xl border border-border hover:shadow-lg transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-lg ${interaction.type === 'meeting' ? 'bg-blue-500/10 text-blue-400' :
                                                    interaction.type === 'call' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        'bg-primary/10 text-primary'
                                                    }`}>
                                                    {interaction.type === 'meeting' ? <Calendar size={14} /> :
                                                        interaction.type === 'call' ? <Phone size={14} /> :
                                                            <MessageSquare size={14} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground text-sm">{interaction.title}</h4>
                                                    <p className="text-[10px] text-gray-500 font-medium">{new Date(interaction.date).toLocaleDateString('pt-PT')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {interaction.location && (
                                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-md border border-border">
                                                        <MapPin size={10} />
                                                        {interaction.location}
                                                    </div>
                                                )}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setActiveMenu(activeMenu === interaction.id ? null : interaction.id)}
                                                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical size={14} className="text-gray-400" />
                                                    </button>
                                                    {activeMenu === interaction.id && (
                                                        <div className="absolute right-0 top-8 bg-white border border-border rounded-xl shadow-lg py-1 z-10 min-w-[120px]">
                                                            <button
                                                                onClick={() => handleEditInteraction(interaction)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
                                                            >
                                                                <Edit2 size={12} />
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteInteraction(interaction.id)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 size={12} />
                                                                Apagar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{interaction.description}</p>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                                    <MessageSquare size={48} className="text-gray-600" />
                                    <p className="text-sm text-gray-500">Nenhuma interação registada.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Interaction Modal */}
            <AnimatePresence>
                {showInteractionModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowInteractionModal(false); setEditingInteraction(null); }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white border border-border w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-8 space-y-6"
                        >
                            <h3 className="text-xl font-bold text-foreground">{editingInteraction ? 'Editar Interação' : 'Registar Interação'}</h3>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                                    <input
                                        type="text"
                                        value={newInteraction.title}
                                        onChange={(e) => setNewInteraction({ ...newInteraction, title: e.target.value })}
                                        placeholder="Ex: Reunião de Alinhamento"
                                        className="w-full bg-secondary border border-border text-foreground px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Data</label>
                                        <input
                                            type="date"
                                            value={newInteraction.date}
                                            onChange={(e) => setNewInteraction({ ...newInteraction, date: e.target.value })}
                                            className="w-full bg-secondary border border-border text-foreground px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                                        <select
                                            value={newInteraction.type}
                                            onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value })}
                                            className="w-full bg-secondary border border-border text-foreground px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        >
                                            <option value="note">Nota</option>
                                            <option value="call">Chamada</option>
                                            <option value="meeting">Reunião</option>
                                            <option value="email">Email</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Localização</label>
                                    <input
                                        type="text"
                                        value={newInteraction.location}
                                        onChange={(e) => setNewInteraction({ ...newInteraction, location: e.target.value })}
                                        placeholder="Ex: Zoom, Escritório, etc."
                                        className="w-full bg-secondary border border-border text-foreground px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
                                    <textarea
                                        value={newInteraction.description}
                                        onChange={(e) => setNewInteraction({ ...newInteraction, description: e.target.value })}
                                        rows={4}
                                        placeholder="O que foi discutido?"
                                        className="w-full bg-secondary border border-border text-foreground px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => { setShowInteractionModal(false); setEditingInteraction(null); setNewInteraction({ title: '', description: '', location: '', type: 'note', date: new Date().toISOString().split('T')[0] }); }}
                                    className="flex-1 py-4 text-muted-foreground font-bold hover:text-foreground transition-colors"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    onClick={editingInteraction ? handleUpdateInteraction : handleAddInteraction}
                                    className="flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
                                >
                                    GUARDAR
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
