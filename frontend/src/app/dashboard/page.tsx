import { Metadata } from 'next';
import { RequireAuth } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Dashboard | MindConnect',
  description: 'Your personal MindConnect dashboard with mental health, financial education, and digital wellness insights.',
};

function DashboardContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to MindConnect Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                This is a protected route that requires authentication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}