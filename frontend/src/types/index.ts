// Common types for the MindConnect platform

export interface User {
  id: string;
  email: string;
  username: string;
  dateOfBirth?: Date;
  preferences?: UserPreferences;
  createdAt: Date;
  lastActive?: Date;
  isVerified: boolean;
  profilePicture?: string;
}

export interface UserPreferences {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  theme: 'light' | 'dark' | 'system';
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  types: {
    assessment: boolean;
    community: boolean;
    educational: boolean;
    reminders: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  dataSharing: boolean;
  analyticsOptOut: boolean;
  communityParticipation: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  textToSpeech: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
}

// Mental Health Zone Types
export interface AssessmentResult {
  id: string;
  userId: string;
  type: 'stress' | 'depression' | 'anxiety' | 'wellbeing';
  score: number;
  responses: Record<string, any>;
  recommendations: string[];
  completedAt: Date;
}

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  mood: MoodLevel;
  triggers: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface CommunityPost {
  id: string;
  userId: string;
  category: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  isModerated: boolean;
  createdAt: Date;
  updatedAt?: Date;
  replies?: CommunityReply[];
}

export interface CommunityReply {
  id: string;
  postId: string;
  userId: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
}

// Financial Education Zone Types
export interface SimulationSession {
  id: string;
  userId: string;
  scenario: string;
  decisions: Decision[];
  score: number;
  completedAt: Date;
}

export interface Decision {
  id: string;
  question: string;
  selectedOption: string;
  correctOption: string;
  points: number;
  explanation: string;
}

export interface LearningProgress {
  userId: string;
  moduleId: string;
  completionPercentage: number;
  lastAccessed: Date;
  certificateEarned: boolean;
  quiz_scores: QuizScore[];
}

export interface QuizScore {
  quizId: string;
  score: number;
  maxScore: number;
  completedAt: Date;
}

// Digital Wellness Zone Types
export interface ScreenTimeData {
  userId: string;
  date: Date;
  totalMinutes: number;
  appBreakdown: AppUsage[];
  goals: DigitalGoal[];
}

export interface AppUsage {
  appName: string;
  minutes: number;
  category: string;
}

export interface DigitalGoal {
  id: string;
  type: 'daily_limit' | 'app_limit' | 'break_reminder';
  target: number;
  current: number;
  isActive: boolean;
}

export interface DetoxChallenge {
  id: string;
  userId: string;
  type: '7day' | '14day' | '30day';
  startDate: Date;
  endDate: Date;
  currentStreak: number;
  isActive: boolean;
  checkIns: DetoxCheckIn[];
}

export interface DetoxCheckIn {
  date: Date;
  success: boolean;
  notes?: string;
}

// Access & Inclusion Zone Types
export interface ServiceLocation {
  id: string;
  name: string;
  type: 'mental_health' | 'career_guidance' | 'education' | 'healthcare';
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hours: string;
  rating?: number;
  reviews?: ServiceReview[];
}

export interface ServiceReview {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  isAnonymous: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  type: 'scholarship' | 'internship' | 'job' | 'volunteer';
  description: string;
  requirements: string[];
  deadline: Date;
  applicationUrl: string;
  organization: string;
  location?: string;
  isActive: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  agreeToTerms: boolean;
}

export interface PasswordResetForm {
  email: string;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileForm {
  username?: string;
  dateOfBirth?: string;
  preferences?: UserPreferences;
}

export interface ProfilePictureUploadResponse {
  profilePictureUrl: string;
}

// Socket.io Event Types
export interface SocketEvents {
  // Connection events
  connect: () => void;
  disconnect: () => void;
  
  // Chat events
  'join-room': (room: string) => void;
  'leave-room': (room: string) => void;
  'send-message': (message: ChatMessage) => void;
  'receive-message': (message: ChatMessage) => void;
  
  // Notification events
  'notification': (notification: Notification) => void;
  
  // Real-time updates
  'community-post-update': (post: CommunityPost) => void;
  'user-status-update': (status: UserStatus) => void;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  room?: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: Date;
  isRead: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface UserStatus {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
  currentActivity?: string;
}