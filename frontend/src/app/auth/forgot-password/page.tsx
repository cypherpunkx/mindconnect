import { Metadata } from 'next';
import { PasswordReset, GuestOnly } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Forgot Password | MindConnect',
  description: 'Reset your MindConnect account password to regain access to your mental health and wellness resources.',
};

export default function ForgotPasswordPage() {
  return (
    <GuestOnly>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <PasswordReset mode="forgot" />
      </div>
    </GuestOnly>
  );
}