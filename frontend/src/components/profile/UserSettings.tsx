'use client';

import React, { useState, useEffect } from 'react';
import { UserPreferences, NotificationSettings, PrivacySettings, AccessibilitySettings } from '@/types';

interface UserSettingsProps {
  preferences?: UserPreferences;
  onUpdate: (preferences: UserPreferences) => void;
  isLoading: boolean;
}

const UserSettings: React.FC<UserSettingsProps> = ({
  preferences,
  onUpdate,
  isLoading
}) => {
  const [formData, setFormData] = useState<UserPreferences>({
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      sms: false,
      frequency: 'daily',
      types: {
        assessment: true,
        community: true,
        educational: true,
        reminders: true,
      }
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analyticsOptOut: false,
      communityParticipation: true,
    },
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      textToSpeech: false,
      keyboardNavigation: false,
      reducedMotion: false,
    }
  });

  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  const handleNotificationChange = (key: keyof NotificationSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handleNotificationTypeChange = (type: keyof NotificationSettings['types'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        types: {
          ...prev.notifications.types,
          [type]: value
        }
      }
    }));
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handleAccessibilityChange = (key: keyof AccessibilitySettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [key]: value
      }
    }));
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setFormData(prev => ({
      ...prev,
      theme
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Theme Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as const).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => handleThemeChange(theme)}
                  className={`p-3 border rounded-md text-sm font-medium capitalize ${
                    formData.theme === theme
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
        <div className="space-y-4">
          {/* Notification Channels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Notification Channels
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifications.email}
                  onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Email notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifications.push}
                  onChange={(e) => handleNotificationChange('push', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Push notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifications.sms}
                  onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">SMS notifications</span>
              </label>
            </div>
          </div>

          {/* Notification Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Frequency
            </label>
            <select
              value={formData.notifications.frequency}
              onChange={(e) => handleNotificationChange('frequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily digest</option>
              <option value="weekly">Weekly digest</option>
            </select>
          </div>

          {/* Notification Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Notification Types
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifications.types.assessment}
                  onChange={(e) => handleNotificationTypeChange('assessment', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Assessment reminders and results</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifications.types.community}
                  onChange={(e) => handleNotificationTypeChange('community', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Community updates and replies</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifications.types.educational}
                  onChange={(e) => handleNotificationTypeChange('educational', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Educational content and achievements</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifications.types.reminders}
                  onChange={(e) => handleNotificationTypeChange('reminders', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">General reminders and tips</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={formData.privacy.profileVisibility}
              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Control who can see your profile information
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.privacy.dataSharing}
                onChange={(e) => handlePrivacyChange('dataSharing', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Allow data sharing for research purposes</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.privacy.analyticsOptOut}
                onChange={(e) => handlePrivacyChange('analyticsOptOut', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Opt out of analytics tracking</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.privacy.communityParticipation}
                onChange={(e) => handlePrivacyChange('communityParticipation', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Allow community participation</span>
            </label>
          </div>
        </div>
      </div>

      {/* Accessibility Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Accessibility</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <select
              value={formData.accessibility.fontSize}
              onChange={(e) => handleAccessibilityChange('fontSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.accessibility.highContrast}
                onChange={(e) => handleAccessibilityChange('highContrast', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">High contrast mode</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.accessibility.textToSpeech}
                onChange={(e) => handleAccessibilityChange('textToSpeech', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Text-to-speech</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.accessibility.keyboardNavigation}
                onChange={(e) => handleAccessibilityChange('keyboardNavigation', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Enhanced keyboard navigation</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.accessibility.reducedMotion}
                onChange={(e) => handleAccessibilityChange('reducedMotion', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Reduced motion</span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};

export default UserSettings;