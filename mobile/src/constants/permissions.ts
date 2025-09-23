import { UserRole, PermissionMap } from '@/types';

// Define permissions for each user role based on the Python system
export const PERMISSIONS: PermissionMap = {
  // Student permissions
  'view_dashboard': ['aluno', 'funcionario', 'direcao'],
  'create_report': ['aluno', 'funcionario', 'direcao'],
  'view_own_reports': ['aluno', 'funcionario', 'direcao'],
  'view_notices': ['aluno', 'funcionario', 'direcao'],
  'view_emergency_info': ['aluno', 'funcionario', 'direcao'],
  'view_contacts': ['aluno', 'funcionario', 'direcao'],
  'view_evacuation_plan': ['aluno', 'funcionario', 'direcao'],
  'view_campaigns': ['aluno', 'funcionario', 'direcao'],
  'view_school_map': ['aluno', 'funcionario', 'direcao'],
  'trigger_emergency': ['aluno', 'funcionario', 'direcao'],
  
  // Staff permissions (includes all student permissions)
  'manage_visitors': ['funcionario', 'direcao'],
  'create_incident': ['funcionario', 'direcao'],
  'view_incidents': ['funcionario', 'direcao'],
  'update_checklist': ['funcionario', 'direcao'],
  'view_checklist': ['funcionario', 'direcao'],
  'view_surveillance': ['funcionario', 'direcao'],
  'view_all_reports': ['funcionario', 'direcao'],
  'update_report_status': ['funcionario', 'direcao'],
  
  // Admin/Direction permissions (includes all previous permissions)
  'manage_users': ['direcao'],
  'create_notice': ['direcao'],
  'manage_notices': ['direcao'],
  'create_emergency_alert': ['direcao'],
  'manage_emergency_alerts': ['direcao'],
  'create_campaign': ['direcao'],
  'manage_campaigns': ['direcao'],
  'create_drill': ['direcao'],
  'manage_drills': ['direcao'],
  'view_admin_reports': ['direcao'],
  'manage_contacts': ['direcao'],
  'manage_evacuation_plan': ['direcao'],
  'manage_risk_areas': ['direcao'],
  'create_checklist_items': ['direcao'],
  'delete_reports': ['direcao'],
  'system_settings': ['direcao']
};

export const USER_ROLE_LABELS = {
  'aluno': 'Aluno',
  'funcionario': 'Funcionário',
  'direcao': 'Direção'
} as const;

export const REPORT_TYPES = {
  'bullying': 'Bullying',
  'violence': 'Violência',
  'infrastructure': 'Infraestrutura',
  'security': 'Segurança',
  'other': 'Outro'
} as const;

export const EMERGENCY_TYPES = {
  'fire': 'Incêndio',
  'evacuation': 'Evacuação',
  'lockdown': 'Bloqueio',
  'medical': 'Emergência Médica',
  'security': 'Segurança',
  'weather': 'Clima Severo',
  'other': 'Outro'
} as const;

export const PRIORITY_LEVELS = {
  'low': 'Baixa',
  'medium': 'Média',
  'high': 'Alta',
  'urgent': 'Urgente',
  'critical': 'Crítica'
} as const;

export const STATUS_LABELS = {
  'pending': 'Pendente',
  'in_progress': 'Em Andamento',
  'resolved': 'Resolvido',
  'rejected': 'Rejeitado',
  'open': 'Aberto',
  'closed': 'Fechado',
  'active': 'Ativo',
  'inactive': 'Inativo',
  'scheduled': 'Agendado',
  'completed': 'Concluído',
  'cancelled': 'Cancelado'
} as const;