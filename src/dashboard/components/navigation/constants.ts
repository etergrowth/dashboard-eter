import {
  LayoutDashboard,
  Users,
  Briefcase,
  Image,
  FileText,
  Target,
  Wallet,
  Inbox,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItemConfig {
  id: string;
  name: string;
  to: string;
  iconKey: string;
  visible: boolean;
  order: number;
}

export const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Inbox,
  Target,
  Users,
  Briefcase,
  FileText,
  Wallet,
  Image,
};

export const DEFAULT_NAVIGATION: NavigationItemConfig[] = [
  { id: 'dashboard', name: 'Dashboard', to: '/dashboard', iconKey: 'LayoutDashboard', visible: true, order: 0 },
  { id: 'leads-website', name: 'Leads Website', to: '/dashboard/sandbox/pendentes', iconKey: 'Inbox', visible: true, order: 1 },
  { id: 'prospeccao', name: 'Prospecção', to: '/dashboard/sandbox', iconKey: 'Target', visible: true, order: 2 },
  { id: 'crm', name: 'CRM', to: '/dashboard/crm', iconKey: 'Users', visible: true, order: 3 },
  { id: 'projetos', name: 'Projetos', to: '/dashboard/projects', iconKey: 'Briefcase', visible: true, order: 4 },
  { id: 'propostas', name: 'Propostas', to: '/dashboard/proposals', iconKey: 'FileText', visible: true, order: 5 },
  { id: 'financas', name: 'Finanças', to: '/dashboard/finance', iconKey: 'Wallet', visible: true, order: 6 },
  { id: 'cms', name: 'CMS', to: '/dashboard/cms', iconKey: 'Image', visible: true, order: 7 },
];
