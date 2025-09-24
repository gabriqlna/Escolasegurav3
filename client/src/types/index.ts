// Base types for the School Security System
export type UserRole = 'aluno' | 'funcionario' | 'direcao';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Report {
  id: string;
  type: 'bullying' | 'violence' | 'infrastructure' | 'security' | 'other';
  title: string;
  description: string;
  location?: string;
  isAnonymous: boolean;
  reporterId?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
}

export interface EmergencyAlert {
  id: string;
  type: 'fire' | 'evacuation' | 'lockdown' | 'medical' | 'security' | 'weather' | 'other';
  title: string;
  description: string;
  location?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface Visitor {
  id: string;
  name: string;
  document: string;
  phone?: string;
  purpose: string;
  hostName: string;
  hostId?: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: 'checked_in' | 'checked_out';
  badgeNumber?: string;
  checkOutNote?: string;
  registeredBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // in minutes
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect?: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'digital_safety' | 'traffic_education' | 'anti_bullying' | 'emergency_preparedness' | 'general';
  targetAudience: UserRole[];
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  imageUrl?: string;
  quiz?: Quiz;
  views: number;
  completions: number;
}

export interface CampaignRead {
  id: string;
  campaignId: string;
  userId: string;
  hasRead: boolean;
  hasCompleted: boolean;
  viewedAt?: Date;
  readAt?: Date;
  quizAnswers?: QuizAnswer[];
  quizScore?: number;
  quizCompletedAt?: Date;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  category: 'equipment' | 'conflict' | 'accident' | 'security' | 'health' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  involvedPersons?: string[];
  actionsTaken?: string;
  followUpRequired: boolean;
  reportedBy: string;
  createdAt: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: 'safety' | 'security' | 'infrastructure' | 'equipment' | 'cleanliness' | 'other';
  isRequired: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'on-demand';
  assignedTo?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  isActive: boolean;
}

export interface ChecklistCompletion {
  id: string;
  checklistItemId: string;
  completedBy: string;
  completedAt: Date;
  notes?: string;
  status: 'completed' | 'partial' | 'not-applicable' | 'failed';
  evidenceUrls?: string[];
}

export interface Drill {
  id: string;
  type: 'fire' | 'earthquake' | 'lockdown' | 'evacuation' | 'medical' | 'weather' | 'other';
  title: string;
  description: string;
  scheduledFor: Date;
  duration?: number; // in minutes
  location?: string;
  participantGroups: UserRole[];
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  completedAt?: Date;
  feedback?: DrillFeedback[];
  results?: DrillResults;
}

export interface DrillFeedback {
  id: string;
  userId: string;
  userName: string;
  feedback: string;
  rating: 1 | 2 | 3 | 4 | 5;
  submittedAt: Date;
}

export interface DrillResults {
  participantCount: number;
  averageEvacuationTime?: number;
  issuesIdentified: string[];
  improvementSuggestions: string[];
  overallRating: 1 | 2 | 3 | 4 | 5;
  completionNotes?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'maintenance' | 'event' | 'policy' | 'safety';
  targetAudience: UserRole[];
  isPublished: boolean;
  publishDate: Date;
  expiryDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  readBy?: NoticeRead[];
}

export interface NoticeRead {
  userId: string;
  readAt: Date;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority: 'normal' | 'high';
  sound?: string;
  badge?: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface ReportForm {
  type: Report['type'];
  title: string;
  description: string;
  location?: string;
  isAnonymous: boolean;
  priority: Report['priority'];
}

export interface VisitorForm {
  name: string;
  document: string;
  phone?: string;
  purpose: string;
  hostName: string;
  hostId?: string;
  badgeNumber?: string;
}

export interface EmergencyForm {
  type: EmergencyAlert['type'];
  title: string;
  description: string;
  location?: string;
  severity: EmergencyAlert['severity'];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Permission types
export type Permission = 
  | 'reports:create'
  | 'reports:view'
  | 'reports:manage'
  | 'users:view'
  | 'users:manage'
  | 'visitors:register'
  | 'visitors:manage'
  | 'emergency:trigger'
  | 'emergency:manage'
  | 'campaigns:view'
  | 'campaigns:manage'
  | 'checklist:view'
  | 'checklist:complete'
  | 'checklist:manage'
  | 'drills:participate'
  | 'drills:manage'
  | 'notices:view'
  | 'notices:create'
  | 'notices:manage'
  | 'dashboard:view'
  | 'dashboard:admin';

export interface RolePermissions {
  [key: string]: Permission[];
}

// Statistics types
export interface DashboardStats {
  activeReports: number;
  resolvedReports: number;
  activeAlerts: number;
  visitorsToday: number;
  totalUsers: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'report' | 'alert' | 'visitor' | 'drill' | 'notice';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

// Navigation types for migration from React Native
export interface TabRoute {
  name: string;
  title: string;
  icon: string;
  component: React.ComponentType;
  requiresPermission?: Permission | Permission[];
}

// Theme types for styling consistency
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}