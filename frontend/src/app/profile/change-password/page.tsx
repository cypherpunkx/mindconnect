'use client';

import React from 'react';
import Link from 'next/link';
import ChangePassword from '@/components/profile/ChangePassword';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const ChangePasswordPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto">
          {/* Back Link */}
          <div className="mb-6">
            <Link 
              href="/profile" 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Profile
            </Link>
          </div>

          {/* Change Password Component */}
          <ChangePassword 
            onSuccess={() => {
              // Could redirect or show additional success message
              console.log('Password changed successfully');
            }}
            onError={(error) => {
              console.error('Password change error:', error);
            }}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ChangePasswordPage;