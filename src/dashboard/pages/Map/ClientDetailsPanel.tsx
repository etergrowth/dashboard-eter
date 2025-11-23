import { X, Phone, Mail, Building, MapPin, Calendar, DollarSign, Tag } from 'lucide-react';
import type { Client } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ClientDetailsPanelProps {
    client: Client | null;
    onClose: () => void;
}

export function ClientDetailsPanel({ client, onClose }: ClientDetailsPanelProps) {
    return (
        <AnimatePresence>
            {client && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-[#0F1219] border-l border-white/10 z-50 shadow-2xl overflow-y-auto"
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">{client.name}</h2>
                                    {client.company && (
                                        <div className="flex items-center text-gray-400">
                                            <Building className="w-4 h-4 mr-2" />
                                            <span>{client.company}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Status Badge */}
                            <div className="mb-8">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${client.status === 'closed'
                                        ? 'bg-green-500/20 text-green-400'
                                        : client.status === 'lead'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : client.status === 'lost'
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <button className="flex items-center justify-center gap-2 bg-[#7BA8F9] text-[#0F1219] py-2 px-4 rounded-lg font-medium hover:bg-[#5B8DEF] transition-colors">
                                    <Phone className="w-4 h-4" />
                                    Ligar
                                </button>
                                <button className="flex items-center justify-center gap-2 bg-white/5 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/10 transition-colors border border-white/10">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </button>
                            </div>

                            {/* Details */}
                            <div className="space-y-6">
                                {/* Contact Info */}
                                <div className="glass-panel p-4 rounded-xl space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Contacto</h3>
                                    {client.email && (
                                        <div className="flex items-center text-gray-300">
                                            <Mail className="w-4 h-4 mr-3 text-gray-500" />
                                            {client.email}
                                        </div>
                                    )}
                                    {client.phone && (
                                        <div className="flex items-center text-gray-300">
                                            <Phone className="w-4 h-4 mr-3 text-gray-500" />
                                            {client.phone}
                                        </div>
                                    )}
                                    {client.address && (
                                        <div className="flex items-start text-gray-300">
                                            <MapPin className="w-4 h-4 mr-3 text-gray-500 mt-1" />
                                            <span>
                                                {client.address}
                                                <br />
                                                {client.city}, {client.country}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Business Info */}
                                <div className="glass-panel p-4 rounded-xl space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Negócio</h3>
                                    {client.value && (
                                        <div className="flex items-center text-gray-300">
                                            <DollarSign className="w-4 h-4 mr-3 text-gray-500" />
                                            <span className="font-mono">{Number(client.value).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center text-gray-300">
                                        <Tag className="w-4 h-4 mr-3 text-gray-500" />
                                        <span className="capitalize">{client.priority} Priority</span>
                                    </div>
                                    <div className="flex items-center text-gray-300">
                                        <Calendar className="w-4 h-4 mr-3 text-gray-500" />
                                        <span>Adicionado em {new Date(client.created_at).toLocaleDateString('pt-PT')}</span>
                                    </div>
                                </div>

                                {/* Tags */}
                                {client.tags && client.tags.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {client.tags.map((tag, index) => (
                                                <span key={index} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
