import { useState } from 'react';
import { Map as MapIcon, Plus } from 'lucide-react';
import { ClientMap } from './ClientMap';

export function Map() {
  const [showAddClient, setShowAddClient] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Mapa de Clientes
          </h1>
          <p className="text-gray-400">
            Visualize clientes e otimize rotas
          </p>
        </div>
        <button
          onClick={() => setShowAddClient(true)}
          className="glass-button px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2 hover:bg-[#7BA8F9]/20 transition"
        >
          <Plus className="w-5 h-5" />
          Adicionar Cliente
        </button>
      </div>

      {/* Client Map */}
      <ClientMap />

      {/* Instructions */}
      <div className="glass-panel p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-[#7BA8F9]" />
          Como usar o mapa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-white font-medium">Adicionar Clientes</h4>
            <ol className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2">
                <span className="text-[#7BA8F9]">1.</span>
                <span>Vá ao CRM e adicione um novo cliente</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#7BA8F9]">2.</span>
                <span>Preencha o endereço completo</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#7BA8F9]">3.</span>
                <span>O sistema fará geocoding automático</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#7BA8F9]">4.</span>
                <span>O cliente aparecerá no mapa</span>
              </li>
            </ol>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-medium">Recursos do Mapa</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#7BA8F9] rounded-full"></span>
                <span>Clique nos markers para ver detalhes</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#7BA8F9] rounded-full"></span>
                <span>Zoom e navegação com mouse/touch</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#7BA8F9] rounded-full"></span>
                <span>Ajuste automático para mostrar todos os clientes</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#7BA8F9] rounded-full"></span>
                <span>Visualize status e informações de contacto</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
