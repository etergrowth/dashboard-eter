import { ServicesTable } from '../Proposals/ServicesTable';
import { PageHeader } from '../../components/sections';

export function Services() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Serviços"
        description="Gerir serviços, preços e configurações de tarifas"
      />

      <ServicesTable />
    </div>
  );
}
