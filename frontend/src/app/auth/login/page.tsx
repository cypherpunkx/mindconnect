import { Metadata } from 'next';
import { LoginForm, GuestOnly } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Sign In | MindConnect',
  description: 'Sign in to your MindConnect account to access mental health resources, financial education, and digital wellness tools.',
};

export default function LoginPage() {
  return (
    <GuestOnly>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <LoginForm />
      </div>
    </GuestOnly>
  );
}