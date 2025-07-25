import { Metadata } from 'next';
import { RegisterForm, GuestOnly } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Sign Up | MindConnect',
  description: 'Create your MindConnect account to access mental health resources, financial education, and digital wellness tools designed for youth.',
};

export default function RegisterPage() {
  return (
    <GuestOnly>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <RegisterForm />
      </div>
    </GuestOnly>
  );
}