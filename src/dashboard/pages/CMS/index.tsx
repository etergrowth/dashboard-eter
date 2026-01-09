import { useState, useRef } from 'react';
import { Upload, Folder, FileText, Trash2, Download, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useMediaFiles, useUploadFile, useDeleteFile } from '../../hooks/useMediaFiles';
import { PageHeader, StatsGrid, ActionButton, LoadingState, EmptyState } from '../../components/sections';

export function CMS() {
  const { data: mediaFiles, isLoading } = useMediaFiles();
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Form state for upload metadata
  const [uploadMetadata, setUploadMetadata] = useState({
    category: '',
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadFiles(Array.from(files));
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);

    for (const file of files) {
      try {
        await uploadFile.mutateAsync({
          file,
          metadata: {
            name: file.name,
            category: uploadMetadata.category || null,
          },
        });
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setUploading(false);
    setUploadMetadata({
      category: '',
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar "${name}"?`)) {
      deleteFile.mutate(id);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copiado para a área de transferência!');
  };

  const isImage = (fileType: string | null) => {
    return fileType?.startsWith('image/');
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const stats = [
    {
      name: 'Total Ficheiros',
      value: mediaFiles?.length || 0,
    },
    {
      name: 'Imagens',
      value: mediaFiles?.filter((f) => isImage(f.file_type)).length || 0,
    },
    {
      name: 'Documentos',
      value: mediaFiles?.filter((f) => !isImage(f.file_type)).length || 0,
    },
    {
      name: 'Total',
      value: formatFileSize(mediaFiles?.reduce((acc, f) => acc + (f.file_size || 0), 0) || 0),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="CMS - Media Manager"
        description="Gestão de imagens e ficheiros"
        action={
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-semibold disabled:opacity-50"
            style={{
              backgroundColor: uploading ? 'hsl(var(--muted))' : 'hsl(var(--primary))',
              color: uploading ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary-foreground))',
            }}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                A carregar...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Ficheiros
              </>
            )}
          </button>
        }
      />

      <StatsGrid stats={stats} columns={4} />

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-panel p-12 rounded-xl border-2 border-dashed ${
          dragActive ? 'border-[#7BA8F9] bg-[#7BA8F9]/10' : 'border-white/20'
        } text-center hover:border-[#7BA8F9]/50 transition cursor-pointer`}
      >
        <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Arraste ficheiros para aqui
        </h3>
        <p className="text-gray-400 mb-4">
          ou clique para selecionar ficheiros do seu computador
        </p>
        <p className="text-sm text-gray-500">
          Suporta: JPG, PNG, GIF, PDF, DOC, XLS (máx. 50MB)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Upload Metadata Form */}
      <div className="glass-panel p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Metadata do Upload (Opcional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
            <select
              value={uploadMetadata.category || ''}
              onChange={(e) => setUploadMetadata({ ...uploadMetadata, category: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7BA8F9]"
            >
              <option value="">Sem categoria</option>
              <option value="image">Imagem</option>
              <option value="document">Documento</option>
              <option value="contract">Contrato</option>
              <option value="invoice">Fatura</option>
              <option value="presentation">Apresentação</option>
            </select>
          </div>
        </div>
      </div>

      {/* Files Grid */}
      {isLoading ? (
        <LoadingState message="A carregar ficheiros..." />
      ) : mediaFiles && mediaFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mediaFiles.map((file) => (
            <div key={file.id} className="glass-panel rounded-xl overflow-hidden group">
              {/* File Preview */}
              <div className="aspect-video bg-white/5 flex items-center justify-center relative overflow-hidden">
                {isImage(file.file_type) && file.public_url ? (
                  <img
                    src={file.public_url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-16 h-16 text-gray-600" />
                )}
              </div>

              {/* File Info */}
              <div className="p-4">
                <h4 className="text-white font-medium mb-1 truncate">{file.name}</h4>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatFileSize(file.file_size)}</span>
                  {file.category && <span className="px-2 py-1 bg-white/5 rounded">{file.category}</span>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                  {file.public_url && (
                    <>
                      <button
                        onClick={() => copyToClipboard(file.public_url!)}
                        className="flex-1 px-3 py-2 bg-[#7BA8F9]/20 hover:bg-[#7BA8F9]/30 rounded-lg transition text-white text-xs font-medium flex items-center justify-center gap-2"
                        title="Copiar URL"
                      >
                        <LinkIcon className="w-3 h-3" />
                        Copiar
                      </button>
                      <a
                        href={file.public_url}
                        download
                        className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(file.id, file.name)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition text-gray-400 hover:text-red-400"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Folder}
          title="Biblioteca vazia"
          description="Faça upload de imagens e ficheiros para começar"
        />
      )}
    </div>
  );
}
