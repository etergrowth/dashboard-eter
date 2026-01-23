import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import type { LeadSandboxInsert, LeadSource } from '../../../types/sandbox';

interface LeadFormProps {
  onSubmit: (lead: LeadSandboxInsert) => void;
  onCancel: () => void;
  initialData?: Partial<LeadSandboxInsert>;
  isLoading?: boolean;
}

const sources: { value: LeadSource; label: string }[] = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Indicação' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'email', label: 'Email' },
  { value: 'door_to_door', label: 'Porta-a-Porta' },
];

export function LeadForm({ onSubmit, onCancel, initialData, isLoading }: LeadFormProps) {
  const [formData, setFormData] = useState<LeadSandboxInsert>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    linkedin_url: initialData?.linkedin_url || '',
    location: initialData?.location || '',
    company: initialData?.company || '',
    job_title: initialData?.job_title || '',
    company_size: initialData?.company_size,
    source: initialData?.source || 'linkedin',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof LeadSandboxInsert, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="company">Empresa *</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="job_title">Cargo</Label>
          <Input
            id="job_title"
            value={formData.job_title || ''}
            onChange={(e) => handleChange('job_title', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="company_size">Tamanho da Empresa</Label>
          <Input
            id="company_size"
            type="number"
            value={formData.company_size || ''}
            onChange={(e) => handleChange('company_size', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Número de colaboradores"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="linkedin_url">URL do LinkedIn</Label>
        <Input
          id="linkedin_url"
          type="url"
          value={formData.linkedin_url || ''}
          onChange={(e) => handleChange('linkedin_url', e.target.value)}
          placeholder="https://linkedin.com/in/..."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="location">Localização</Label>
        <Input
          id="location"
          value={formData.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="source">Origem *</Label>
        <select
          id="source"
          value={formData.source}
          onChange={(e) => handleChange('source', e.target.value as LeadSource)}
          required
          className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {sources.map((source) => (
            <option key={source.value} value={source.value}>
              {source.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'A guardar...' : 'Guardar Lead'}
        </Button>
      </div>
    </form>
  );
}
