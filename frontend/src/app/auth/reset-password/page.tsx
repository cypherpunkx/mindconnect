import { Metadata } from 'next';
import { Suspense } from 'react';
import { PasswordReset, GuestOnly } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Reset Password | MindConnect',
  description: 'Set a new password for your MindConnect account.',
};

function PasswordResetFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we load the password reset page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <GuestOnly>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<PasswordResetFallback />}>
          <PasswordReset mode="reset" />
        </Suspense>
      </div>
    </GuestOnly>
  );
}