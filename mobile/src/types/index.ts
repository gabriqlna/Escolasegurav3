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
  reportedAt: Date;
  updatedAt?: Date;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: 'daily' | 'weekly' | 'monthly' | 'emergency';
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  dueDate?: Date;
  createdBy: string;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface Drill {
  id: string;
  title: string;
  description: string;
  type: 'fire' | 'earthquake' | 'evacuation' | 'lockdown' | 'medical' | 'other';
  scheduledDate: Date;
  duration?: number; // in minutes
  location?: string;
  participants?: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  results?: string;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: UserRole[];
  isActive: boolean;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  readBy?: string[]; // user IDs who have read the notice
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  department?: string;
  phone?: string;
  email?: string;
  emergencyOnly: boolean;
  isActive: boolean;
  category: 'internal' | 'emergency' | 'external' | 'health' | 'security';
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserFavorite {
  id: string;
  userId: string;
  contactIds?: string[];
  campaignIds?: string[];
  updatedAt: Date;
}

export interface EvacuationPlan {
  id: string;
  title: string;
  description: string;
  areas: string[];
  procedures: string[];
  assemblyPoints: {
    id: string;
    name: string;
    location: string;
    capacity: number;
    coordinates?: { latitude: number; longitude: number };
  }[];
  emergencyContacts: Contact[];
  mapImageUrl?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface RiskArea {
  id: string;
  name: string;
  description: string;
  location: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskType: 'structural' | 'chemical' | 'electrical' | 'fire' | 'medical' | 'security' | 'other';
  coordinates?: { latitude: number; longitude: number };
  precautions: string[];
  emergencyProcedures: string[];
  isActive: boolean;
  identifiedBy: string;
  identifiedAt: Date;
  lastInspection?: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Reports: undefined;
  Emergency: undefined;
  Profile: undefined;
};

// Permission types
export interface PermissionMap {
  [key: string]: UserRole[];
}

// Notification types
export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority: 'normal' | 'high';
  sound?: string;
  badge?: number;
}