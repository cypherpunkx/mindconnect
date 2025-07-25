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
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  dataSharing: boolean;
  analyticsOptOut: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  textToSpeech: boolean;
  keyboardNavigation: boolean;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  dateOfBirth?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface UpdateProfileRequest {
  username?: string;
  dateOfBirth?: string;
  preferences?: UserPreferences;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UploadProfilePictureResponse {
  profilePictureUrl: string;
}